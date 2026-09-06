using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FloreriaApi.Data;
using FloreriaApi.DTOs;
using FloreriaApi.Models;

namespace FloreriaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { message = "Usuario y contraseña requeridos" });
            }

            var hashedPassword = DbInitializer.HashPassword(dto.Password);
            var user = await _context.AdminUsers.FirstOrDefaultAsync(u => 
                u.Username.ToLower() == dto.Username.ToLower() && u.PasswordHash == hashedPassword);

            if (user == null)
            {
                return Unauthorized(new { message = "Usuario o contraseña incorrectos" });
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"] ?? "FloreriaLaCarretaSuperSecretKey2026!AntioquiaCaldas";
            var key = Encoding.UTF8.GetBytes(jwtKey);
            var expires = DateTime.UtcNow.AddDays(7);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = expires,
                Issuer = _configuration["Jwt:Issuer"] ?? "FloreriaLaCarretaApi",
                Audience = _configuration["Jwt:Audience"] ?? "FloreriaLaCarretaApp",
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new AuthResponseDto
            {
                Username = user.Username,
                Role = user.Role,
                Token = tokenString,
                ExpiresAt = expires
            });
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var username = User.Identity?.Name ?? "admin";
            var user = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            var currentHash = DbInitializer.HashPassword(dto.CurrentPassword);
            if (user.PasswordHash != currentHash)
            {
                return BadRequest(new { message = "La contraseña actual es incorrecta" });
            }

            user.PasswordHash = DbInitializer.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Contraseña actualizada exitosamente" });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            return Ok(new
            {
                username = User.Identity?.Name,
                isAuthenticated = true
            });
        }
    }
}
