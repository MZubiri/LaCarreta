using System.ComponentModel.DataAnnotations;

namespace FloreriaApi.DTOs
{
    public class ContactMessageDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(150)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Message { get; set; } = string.Empty;
    }
}
