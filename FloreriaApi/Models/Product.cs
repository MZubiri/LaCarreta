using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FloreriaApi.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string NameEs { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string NameEn { get; set; } = string.Empty;

        [MaxLength(500)]
        public string DescriptionEs { get; set; } = string.Empty;

        [MaxLength(500)]
        public string DescriptionEn { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [MaxLength(300)]
        public string Image { get; set; } = string.Empty;

        public bool Featured { get; set; }

        public bool IsActive { get; set; } = true;

        public string OccasionEs { get; set; } = "[]"; // JSON string array e.g. ["Amor", "Aniversario"]
        public string OccasionEn { get; set; } = "[]";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
