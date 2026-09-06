using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace FloreriaApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<UploadController> _logger;

        public UploadController(IWebHostEnvironment env, ILogger<UploadController> logger)
        {
            _env = env;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> UploadImage(IFormFile? file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No se ha seleccionado ningún archivo" });
            }

            // Max 10MB
            if (file.Length > 10 * 1024 * 1024)
            {
                return BadRequest(new { message = "El archivo excede el tamaño máximo permitido de 10MB" });
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Formato no permitido. Solo se aceptan JPG, JPEG, PNG y WEBP." });
            }

            try
            {
                // Ensure directory exists: uploads/products
                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "products");
                if (!Directory.Exists(uploadsDir))
                {
                    Directory.CreateDirectory(uploadsDir);
                }

                var uniqueFileName = $"prod_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString("N")[..8]}{extension}";
                var filePath = Path.Combine(uploadsDir, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var relativeUrl = $"/uploads/products/{uniqueFileName}";
                return Ok(new { url = relativeUrl, fileName = uniqueFileName });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image");
                return StatusCode(500, new { message = "Error interno al guardar la imagen en el servidor" });
            }
        }
    }
}
