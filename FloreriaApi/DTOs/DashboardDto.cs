using FloreriaApi.Models;

namespace FloreriaApi.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalOrders { get; set; }
        public decimal TotalSales { get; set; }
        public int PendingOrders { get; set; }
        public int PreparingOrders { get; set; }
        public int DeliveringOrders { get; set; }
        public int DeliveredOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal SalesToday { get; set; }
        public decimal SalesThisMonth { get; set; }
        public int TotalProducts { get; set; }
        public List<TopProductDto> TopProducts { get; set; } = new List<TopProductDto>();
        public List<Order> RecentOrders { get; set; } = new List<Order>();
    }

    public class TopProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int UnitsSold { get; set; }
        public decimal Revenue { get; set; }
    }
}
