using System.ComponentModel.DataAnnotations;

namespace FloreriaApi.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Slug { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string NameEs { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string NameEn { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Icon { get; set; } = "🌸";

        public int SortOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;
    }
}
