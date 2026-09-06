using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FloreriaApi.Data;
using FloreriaApi.DTOs;
using FloreriaApi.Models;

namespace FloreriaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/settings
        [HttpGet]
        public async Task<ActionResult<SiteSettings>> GetSettings()
        {
            var settings = await _context.SiteSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                // Fallback default
                settings = new SiteSettings();
                _context.SiteSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(settings);
        }

        // PUT: api/settings
        [Authorize]
        [HttpPut]
        public async Task<IActionResult> UpdateSettings([FromBody] SiteSettingsDto dto)
        {
            var settings = await _context.SiteSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new SiteSettings();
                _context.SiteSettings.Add(settings);
            }

            settings.BusinessPhone = dto.BusinessPhone ?? settings.BusinessPhone;
            settings.WhatsAppNumber = dto.WhatsAppNumber ?? settings.WhatsAppNumber;
            settings.BusinessEmail = dto.BusinessEmail ?? settings.BusinessEmail;
            settings.Address = dto.Address ?? settings.Address;
            settings.City = dto.City ?? settings.City;
            settings.InstagramUrl = dto.InstagramUrl ?? settings.InstagramUrl;
            settings.FacebookUrl = dto.FacebookUrl ?? settings.FacebookUrl;
            settings.ScheduleWeekdays = dto.ScheduleWeekdays ?? settings.ScheduleWeekdays;
            settings.ScheduleWeekends = dto.ScheduleWeekends ?? settings.ScheduleWeekends;
            settings.GoogleMapsEmbedUrl = dto.GoogleMapsEmbedUrl ?? settings.GoogleMapsEmbedUrl;
            settings.DeliveryNotes = dto.DeliveryNotes ?? settings.DeliveryNotes;
            settings.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(settings);
        }
    }
}
