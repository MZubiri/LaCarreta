namespace FloreriaApi.DTOs
{
    public class SiteSettingsDto
    {
        public string BusinessPhone { get; set; } = string.Empty;
        public string WhatsAppNumber { get; set; } = string.Empty;
        public string BusinessEmail { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string InstagramUrl { get; set; } = string.Empty;
        public string FacebookUrl { get; set; } = string.Empty;
        public string ScheduleWeekdays { get; set; } = string.Empty;
        public string ScheduleWeekends { get; set; } = string.Empty;
        public string GoogleMapsEmbedUrl { get; set; } = string.Empty;
        public string DeliveryNotes { get; set; } = string.Empty;
    }
}
