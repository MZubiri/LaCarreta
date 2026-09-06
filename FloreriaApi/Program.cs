using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.FileProviders;
using System.Text;
using FloreriaApi.Data;
using FloreriaApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Pomelo MySQL Server Version (8.0.30)
var serverVersion = new MySqlServerVersion(new Version(8, 0, 30));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, serverVersion, mysqlOptions =>
    {
        mysqlOptions.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null);
    }));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Email Service registration
builder.Services.AddScoped<IEmailService, EmailService>();

// JWT Authentication Configuration
var jwtKey = builder.Configuration["Jwt:Key"] ?? "FloreriaLaCarretaSuperSecretKey2026!AntioquiaCaldasDominioMolinazdev";
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "FloreriaLaCarretaApi",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "FloreriaLaCarretaApp",
        ClockSkew = TimeSpan.Zero
    };
});

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Global Exception Diagnostics Middleware
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[API Error] {context.Request.Method} {context.Request.Path}: {ex.Message}");
        Console.WriteLine(ex.ToString());
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            error = "Database / Internal Server Error",
            message = ex.Message
        });
    }
});

// Enable CORS
app.UseCors("AllowReactApp");

// Setup uploads physical directory & static file mapping
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(); // wwwroot
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Initialize Database Seeder with Retry Loop (up to 15 attempts, 2s apart)
for (int attempt = 1; attempt <= 15; attempt++)
{
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Console.WriteLine($"[DB Init Attempt {attempt}/15] Connecting to MySQL & ensuring schema...");
            DbInitializer.Initialize(dbContext);
            Console.WriteLine("[DB Init] ✅ MySQL database schema created and seeded successfully!");
            break;
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DB Init Attempt {attempt}/15] Failed: {ex.Message}");
        if (attempt == 15)
        {
            Console.WriteLine($"[DB Init FATAL] Could not initialize database after 15 attempts:\n{ex}");
        }
        else
        {
            Thread.Sleep(2000);
        }
    }
}

app.Run();
