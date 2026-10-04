using System.Text;
using System.Text.Json;
using FloreriaApi.Models;

namespace FloreriaApi.Services
{
    public interface ITelegramNotificationService
    {
        Task SendOrderNotificationAsync(Order order, SiteSettings settings);
    }

    public class TelegramNotificationService : ITelegramNotificationService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<TelegramNotificationService> _logger;

        public TelegramNotificationService(IHttpClientFactory httpClientFactory, ILogger<TelegramNotificationService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task SendOrderNotificationAsync(Order order, SiteSettings settings)
        {
            // 1. Send via Telegram Bot if configured
            if (!string.IsNullOrWhiteSpace(settings.TelegramBotToken) && !string.IsNullOrWhiteSpace(settings.TelegramChatId))
            {
                try
                {
                    var client = _httpClientFactory.CreateClient();
                    var botToken = settings.TelegramBotToken.Trim();
                    var chatId = settings.TelegramChatId.Trim();

                    var itemsList = new StringBuilder();
                    foreach (var item in order.Items)
                    {
                        itemsList.AppendLine($"• {item.Quantity}x {item.ProductName} (${item.UnitPrice:N0} c/u)");
                    }

                    var text = $"🌸 *¡NUEVO PEDIDO REGISTRADO!*\n" +
                               $"━━━━━━━━━━━━━━━━━━━━━\n" +
                               $"📋 *Código:* `{order.OrderCode}`\n" +
                               $"👤 *Cliente:* {order.CustomerName}\n" +
                               $"📱 *Teléfono:* [{order.CustomerPhone}](https://wa.me/{order.CustomerPhone.Replace("+", "").Replace(" ", "")})\n" +
                               $"📧 *Email:* {order.CustomerEmail ?? "No indicado"}\n\n" +
                               $"📍 *Municipio:* {order.DeliveryMunicipality}\n" +
                               $"🏠 *Dirección:* {order.DeliveryAddress}\n" +
                               $"📅 *Fecha de Entrega:* {order.DeliveryDate}\n" +
                               $"⏰ *Jornada:* {order.DeliveryTime}\n\n" +
                               $"💌 *Estilo de Tarjeta:* {order.CardStyle}\n" +
                               (!string.IsNullOrWhiteSpace(order.CardSender) ? $"✍️ *De parte de:* {order.CardSender}\n" : "") +
                               (!string.IsNullOrWhiteSpace(order.CardMessage) ? $"💬 *Mensaje:* \"_{order.CardMessage}_\"\n\n" : "\n") +
                               $"💐 *Arreglos Florales:*\n{itemsList}\n" +
                               $"🛵 *Costo Domicilio:* ${(order.DeliveryFee > 0 ? order.DeliveryFee.ToString("N0") : "0 (Gratis/Recoger)")}\n" +
                               $"💰 *TOTAL A COBRAR:* ${order.TotalAmount:N0} COP\n" +
                               $"━━━━━━━━━━━━━━━━━━━━━\n" +
                               $"🔍 *Rastreo Web:* https://floreria.molinazdev.lat/rastreo?codigo={order.OrderCode}";

                    var payload = new
                    {
                        chat_id = chatId,
                        text = text,
                        parse_mode = "Markdown",
                        disable_web_page_preview = true
                    };

                    var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                    var response = await client.PostAsync($"https://api.telegram.org/bot{botToken}/sendMessage", content);

                    if (!response.IsSuccessStatusCode)
                    {
                        var err = await response.Content.ReadAsStringAsync();
                        _logger.LogWarning("Telegram notification failed: {StatusCode} {Error}", response.StatusCode, err);
                    }
                    else
                    {
                        _logger.LogInformation("Telegram notification sent successfully for {Code}", order.OrderCode);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Exception while sending Telegram alert for order {Code}", order.OrderCode);
                }
            }

            // 2. Send via generic Webhook URL if configured
            if (!string.IsNullOrWhiteSpace(settings.WebhookUrl))
            {
                try
                {
                    var client = _httpClientFactory.CreateClient();
                    var content = new StringContent(JsonSerializer.Serialize(order), Encoding.UTF8, "application/json");
                    await client.PostAsync(settings.WebhookUrl.Trim(), content);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Exception while sending Webhook alert for order {Code}", order.OrderCode);
                }
            }
        }
    }
}
