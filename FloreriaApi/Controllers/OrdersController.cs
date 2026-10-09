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

        // GET: api/orders/track (Public - Tracking by OrderCode + Phone/Email verification)
        [HttpGet("track")]
        public async Task<ActionResult<IEnumerable<Order>>> TrackOrderWithParams([FromQuery] string? code = null, [FromQuery] string? verify = null)
        {
            return await ExecuteSecureTrack(code, verify);
        }

        // GET: api/orders/track/{query} (Public - Tracking by OrderCode + Phone/Email verification)
        [HttpGet("track/{query}")]
        public async Task<ActionResult<IEnumerable<Order>>> TrackOrder(string query, [FromQuery] string? verify = null)
        {
            return await ExecuteSecureTrack(query, verify);
        }

        private async Task<ActionResult<IEnumerable<Order>>> ExecuteSecureTrack(string? code, string? verify)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                return BadRequest(new { message = "Por favor ingresa el código de tu pedido." });
            }

            if (string.IsNullOrWhiteSpace(verify))
            {
                return BadRequest(new { message = "Por motivos de seguridad y protección de datos, debes ingresar también el número de teléfono o correo asociado al pedido." });
            }

            var cleanCode = code.Trim().ToLower();
            var cleanVerify = verify.Trim().ToLower();
            var cleanPhone = new string(cleanVerify.Where(char.IsDigit).ToArray());

            var candidateOrders = await _context.Orders
                .Include(o => o.Items)
                .Where(o => !o.IsDeleted && (
                    o.OrderCode.ToLower() == cleanCode ||
                    cleanCode.EndsWith(o.OrderCode.ToLower()) ||
                    o.OrderCode.ToLower().EndsWith(cleanCode) ||
                    cleanCode.Replace("-", "").EndsWith(o.OrderCode.ToLower().Replace("-", ""))
                ))
                .ToListAsync();

            if (!candidateOrders.Any())
            {
                return NotFound(new { message = "No se encontró ningún pedido con ese código." });
            }

            var verifiedOrders = candidateOrders.Where(o =>
            {
                var custPhone = new string((o.CustomerPhone ?? "").Where(char.IsDigit).ToArray());
                var recipPhone = new string((o.RecipientPhone ?? "").Where(char.IsDigit).ToArray());
                var custEmail = (o.CustomerEmail ?? "").Trim().ToLower();

                bool phoneMatch = !string.IsNullOrEmpty(cleanPhone) && cleanPhone.Length >= 7 && (
                    custPhone.EndsWith(cleanPhone) || cleanPhone.EndsWith(custPhone) ||
                    recipPhone.EndsWith(cleanPhone) || cleanPhone.EndsWith(recipPhone)
                );

                bool emailMatch = !string.IsNullOrEmpty(cleanVerify) && cleanVerify.Contains("@") && (
                    custEmail == cleanVerify
                );

                return phoneMatch || emailMatch;
            }).ToList();

            if (!verifiedOrders.Any())
            {
                return Unauthorized(new { message = "El teléfono o correo no coincide con el registrado en este pedido. Verifica tus datos por favor." });
            }

            return Ok(verifiedOrders);
        }

        // GET: api/orders (Admin with optional status and search filters)
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders([FromQuery] string? status = null, [FromQuery] string? search = null)
        {
            var query = _context.Orders.Where(o => !o.IsDeleted).Include(o => o.Items).AsQueryable();

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
            var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => !o.IsDeleted && o.Id == id);

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

            string orderCode;
            if (!string.IsNullOrWhiteSpace(dto.OrderCode))
            {
                orderCode = dto.OrderCode.Trim().ToUpperInvariant();
            }
            else
            {
                var year = DateTime.UtcNow.Year;
                var count = await _context.Orders.CountAsync() + 1;
                orderCode = $"FLC-{year}-{count:D4}";
            }
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
            var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                order.Status = dto.Status;
            }

            if (!string.IsNullOrWhiteSpace(dto.FinalArrangementPhotoUrl))
            {
                order.FinalArrangementPhotoUrl = dto.FinalArrangementPhotoUrl;
            }

            await _context.SaveChangesAsync();

            // Fire and forget webhook alert if configured
            var settings = await _context.SiteSettings.FirstOrDefaultAsync() ?? new SiteSettings();
            _ = Task.Run(async () =>
            {
                try
                {
                    await _telegramService.SendOrderNotificationAsync(order, settings);
                }
                catch { }
            });

            return Ok(new { id = order.Id, status = order.Status, finalArrangementPhotoUrl = order.FinalArrangementPhotoUrl });
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
