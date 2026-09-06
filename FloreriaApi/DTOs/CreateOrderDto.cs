namespace FloreriaApi.DTOs
{
    public class CreateOrderDto
    {
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;
        public string DeliveryDate { get; set; } = string.Empty;
        public string DeliveryTime { get; set; } = string.Empty;
        public string CardMessage { get; set; } = string.Empty;
        public string SpecialNotes { get; set; } = string.Empty;

        public List<CreateOrderItemDto> Items { get; set; } = new List<CreateOrderItemDto>();
    }

    public class CreateOrderItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
