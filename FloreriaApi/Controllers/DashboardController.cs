using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FloreriaApi.Data;
using FloreriaApi.DTOs;

namespace FloreriaApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetStats()
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var firstDayOfMonth = new DateTime(now.Year, now.Month, 1);

            var orders = await _context.Orders.Include(o => o.Items).ToListAsync();
            var totalProducts = await _context.Products.CountAsync();

            var totalOrders = orders.Count;
            var validOrders = orders.Where(o => o.Status != "Cancelado").ToList();
            var totalSales = validOrders.Sum(o => o.TotalAmount);

            var salesToday = validOrders
                .Where(o => o.CreatedAt.Date == today)
                .Sum(o => o.TotalAmount);

            var salesThisMonth = validOrders
                .Where(o => o.CreatedAt >= firstDayOfMonth)
                .Sum(o => o.TotalAmount);

            var pending = orders.Count(o => o.Status == "Pendiente");
            var preparing = orders.Count(o => o.Status == "EnPreparacion");
            var delivering = orders.Count(o => o.Status == "EnCamino");
            var delivered = orders.Count(o => o.Status == "Entregado");
            var cancelled = orders.Count(o => o.Status == "Cancelado");

            // Top Products
            var topProducts = orders
                .Where(o => o.Status != "Cancelado")
                .SelectMany(o => o.Items)
                .GroupBy(i => new { i.ProductId, i.ProductName })
                .Select(g => new TopProductDto
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.ProductName,
                    UnitsSold = g.Sum(i => i.Quantity),
                    Revenue = g.Sum(i => i.TotalPrice)
                })
                .OrderByDescending(tp => tp.UnitsSold)
                .Take(5)
                .ToList();

            var recentOrders = orders
                .OrderByDescending(o => o.CreatedAt)
                .Take(6)
                .ToList();

            return Ok(new DashboardStatsDto
            {
                TotalOrders = totalOrders,
                TotalSales = totalSales,
                PendingOrders = pending,
                PreparingOrders = preparing,
                DeliveringOrders = delivering,
                DeliveredOrders = delivered,
                CancelledOrders = cancelled,
                SalesToday = salesToday,
                SalesThisMonth = salesThisMonth,
                TotalProducts = totalProducts,
                TopProducts = topProducts,
                RecentOrders = recentOrders
            });
        }
    }
}
