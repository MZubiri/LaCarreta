using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FloreriaApi.Data;
using FloreriaApi.Models;
using FloreriaApi.DTOs;
using FloreriaApi.Services;

namespace FloreriaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ITelegramNotificationService _telegramService;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(
            ApplicationDbContext context,
            IEmailService emailService,
            ITelegramNotificationService telegramService,
            ILogger<OrdersController> logger)
        {
            _context = context;
            _emailService = emailService;
            _telegramService = telegramService;
            _logger = logger;
        }

        // GET: api/orders/track/{query} (Public - Tracking by OrderCode or CustomerPhone)
        [HttpGet("track/{query}")]
        public async Task<ActionResult<IEnumerable<Order>>> TrackOrder(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(new { message = "Por favor ingresa un código de pedido o número de teléfono" });
            }

            var cleanQuery = query.Trim().ToLower();
            var cleanPhone = new string(query.Where(char.IsDigit).ToArray());

            var orders = await _context.Orders
                .Include(o => o.Items)
                .Where(o => 
                    o.OrderCode.ToLower().Contains(cleanQuery) ||
                    (!string.IsNullOrEmpty(cleanPhone) && (
                        o.CustomerPhone.Contains(cleanPhone) ||
                        (o.RecipientPhone != null && o.RecipientPhone.Contains(cleanPhone))
                    )) ||
                    (cleanQuery.Length >= 3 && (
                        o.CustomerName.ToLower().Contains(cleanQuery) ||
                        (o.RecipientName != null && o.RecipientName.ToLower().Contains(cleanQuery))
                    )))
                .OrderByDescending(o => o.CreatedAt)
                .Take(5)
                .ToListAsync();

            if (!orders.Any())
            {
                return NotFound(new { message = "No se encontraron pedidos con ese código o número de teléfono" });
            }

            return Ok(orders);
        }

        // GET: api/orders (Admin with optional status and search filters)
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders([FromQuery] string? status = null, [FromQuery] string? search = null)
        {
            var query = _context.Orders.Include(o => o.Items).AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "todos")
            {
                query = query.Where(o => o.Status.ToLower() == status.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower().Trim();
                query = query.Where(o => 
                    o.OrderCode.ToLower().Contains(term) ||
                    o.CustomerName.ToLower().Contains(term) ||
                    o.CustomerPhone.Contains(term) ||
                    (o.RecipientName != null && o.RecipientName.ToLower().Contains(term)) ||
                    (o.RecipientPhone != null && o.RecipientPhone.Contains(term)) ||
                    (o.DeliveryAddress != null && o.DeliveryAddress.ToLower().Contains(term)) ||
                    (o.CustomerEmail != null && o.CustomerEmail.ToLower().Contains(term)));
            }

            return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        }

        // GET: api/orders/5 (Admin)
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            return order;
        }

        // POST: api/orders (Public - checkout from Cart)
        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] CreateOrderDto dto)
        {
            if (dto.Items == null || !dto.Items.Any())
            {
                return BadRequest(new { message = "El pedido no contiene ningún producto" });
            }

            var orderCode = "ORD-" + DateTime.UtcNow.ToString("yyyyMMdd-HHmmss");
            decimal total = 0;

            var items = new List<OrderItem>();
            foreach (var itemDto in dto.Items)
            {
                var lineTotal = itemDto.UnitPrice * itemDto.Quantity;
                total += lineTotal;

                items.Add(new OrderItem
                {
                    ProductId = itemDto.ProductId,
                    ProductName = itemDto.ProductName,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice,
                    TotalPrice = lineTotal
                });
            }

            var order = new Order
            {
                OrderCode = orderCode,
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                CustomerEmail = dto.CustomerEmail,
                RecipientName = !string.IsNullOrWhiteSpace(dto.RecipientName) ? dto.RecipientName : dto.CustomerName,
                RecipientPhone = !string.IsNullOrWhiteSpace(dto.RecipientPhone) ? dto.RecipientPhone : dto.CustomerPhone,
                DeliveryAddress = dto.DeliveryAddress,
                DeliveryMunicipality = !string.IsNullOrWhiteSpace(dto.DeliveryMunicipality) ? dto.DeliveryMunicipality : "Caldas",
                DeliveryFee = dto.DeliveryFee,
                DeliveryDate = dto.DeliveryDate,
                DeliveryTime = dto.DeliveryTime,
                CardStyle = !string.IsNullOrWhiteSpace(dto.CardStyle) ? dto.CardStyle : "Clásica Floral",
                CardSender = dto.CardSender ?? string.Empty,
                CardMessage = dto.CardMessage ?? string.Empty,
                SpecialNotes = dto.SpecialNotes ?? string.Empty,
                TotalAmount = total + dto.DeliveryFee,
                Status = "Pendiente",
                CreatedAt = DateTime.UtcNow,
                Items = items
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Fetch SiteSettings for telegram / email configuration
            var settings = await _context.SiteSettings.FirstOrDefaultAsync() ?? new SiteSettings();

            // Fire and forget notifications so customer response is instant
            _ = Task.Run(async () =>
            {
                try
                {
                    // 1. Email alerts
                    await _emailService.SendOrderNotificationToAdminAsync(order);
                    if (!string.IsNullOrWhiteSpace(order.CustomerEmail))
                    {
                        await _emailService.SendOrderConfirmationToCustomerAsync(order);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send order email for {Code}", order.OrderCode);
                }

                try
                {
                    // 2. Telegram & Webhook alerts
                    await _telegramService.SendOrderNotificationAsync(order, settings);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send Telegram/Webhook alert for {Code}", order.OrderCode);
                }
            });

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        // PUT: api/orders/5/status (Admin)
        [Authorize]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            order.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(new { id = order.Id, status = order.Status });
        }

        // DELETE: api/orders/5 (Admin)
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
