using System.ComponentModel.DataAnnotations;

namespace FloreriaApi.Models
{
    public class AdminUser
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Role { get; set; } = "Admin";
    }
}
