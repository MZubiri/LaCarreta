using System.ComponentModel.DataAnnotations;

namespace FloreriaApi.Models
{
    public class SiteSettings
    {
        [Key]
        public int Id { get; set; } = 1;

        [MaxLength(50)]
        public string BusinessPhone { get; set; } = "+573206468689";

        [MaxLength(50)]
        public string WhatsAppNumber { get; set; } = "573206468689";

        [MaxLength(100)]
        public string BusinessEmail { get; set; } = "pedidos@florerialacarreta.com";

        [MaxLength(200)]
        public string Address { get; set; } = "Cra 49 # 131 Sur-69";

        [MaxLength(100)]
        public string City { get; set; } = "Caldas, Antioquia, Colombia";

        [MaxLength(255)]
        public string InstagramUrl { get; set; } = "https://www.instagram.com/floristeria_la_carreta";

        [MaxLength(255)]
        public string FacebookUrl { get; set; } = "";

        [MaxLength(100)]
        public string ScheduleWeekdays { get; set; } = "Lunes a Sábado: 8:00 AM - 6:00 PM";

        [MaxLength(100)]
        public string ScheduleWeekends { get; set; } = "Domingos y Festivos: Cerrado";

        [MaxLength(1000)]
        public string GoogleMapsEmbedUrl { get; set; } = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.0583547070116!2d-75.6378!3d6.0911!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e468307db4ef757%3A0x6b1c4e78a6ea23f0!2sCra.%2049%20%23131%20Sur-69%2C%20Caldas%2C%20Antioquia!5e0!3m2!1ses!2sco!4v1709000000000!5m2!1ses!2sco";

        [MaxLength(500)]
        public string DeliveryNotes { get; set; } = "Entregas en Caldas, La Estrella, Sabaneta, Itagüí y Envigado.";

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
