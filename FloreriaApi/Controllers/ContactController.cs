using Microsoft.AspNetCore.Mvc;
using FloreriaApi.DTOs;
using FloreriaApi.Services;

namespace FloreriaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<ContactController> _logger;

        public ContactController(IEmailService emailService, ILogger<ContactController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> SendContactMessage([FromBody] ContactMessageDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _emailService.SendContactNotificationAsync(dto);
                return Ok(new { success = true, message = "Tu mensaje ha sido enviado correctamente. Nos pondremos en contacto pronto." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling contact form from {Email}", dto.Email);
                return StatusCode(500, new { success = false, message = "Hubo un problema al enviar tu mensaje. Por favor contáctanos por WhatsApp." });
            }
        }
    }
}
