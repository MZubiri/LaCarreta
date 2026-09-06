using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FloreriaApi.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(30)]
        public string OrderCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string CustomerPhone { get; set; } = string.Empty;

        [MaxLength(100)]
        public string CustomerEmail { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string DeliveryAddress { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string DeliveryDate { get; set; } = string.Empty;

        [MaxLength(50)]
        public string DeliveryTime { get; set; } = string.Empty;

        [MaxLength(500)]
        public string CardMessage { get; set; } = string.Empty;

        [MaxLength(500)]
        public string SpecialNotes { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = "Pendiente"; // Pendiente, EnPreparacion, EnCamino, Entregado, Cancelado

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
