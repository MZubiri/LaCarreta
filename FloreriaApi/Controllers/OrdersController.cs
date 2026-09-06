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
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(ApplicationDbContext context, IEmailService emailService, ILogger<OrdersController> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
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
                DeliveryAddress = dto.DeliveryAddress,
                DeliveryDate = dto.DeliveryDate,
                DeliveryTime = dto.DeliveryTime,
                CardMessage = dto.CardMessage,
                SpecialNotes = dto.SpecialNotes,
                TotalAmount = total,
                Status = "Pendiente",
                CreatedAt = DateTime.UtcNow,
                Items = items
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Fire and forget email notifications so user response is fast
            _ = Task.Run(async () =>
            {
                try
                {
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
