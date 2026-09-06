using System.ComponentModel.DataAnnotations;

namespace FloreriaApi.DTOs
{
    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [MinLength(6, ErrorMessage = "La nueva contraseña debe tener al menos 6 caracteres")]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}
