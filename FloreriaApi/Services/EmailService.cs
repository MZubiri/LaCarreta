using FloreriaApi.DTOs;
using FloreriaApi.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Globalization;

namespace FloreriaApi.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private string Host => _configuration["Smtp:Host"] ?? "smtp.zoho.com";
        private int Port => int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 465;
        private string User => _configuration["Smtp:User"] ?? "";
        private string Password => _configuration["Smtp:Password"] ?? "";
        private string FromEmail => _configuration["Smtp:FromEmail"] ?? "pedidos@florerialacarreta.com";
        private string FromName => _configuration["Smtp:FromName"] ?? "Florería La Carreta";
        private string AdminEmail => _configuration["Smtp:AdminEmail"] ?? "pedidos@florerialacarreta.com";

        public async Task<bool> SendGenericEmailAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            if (string.IsNullOrWhiteSpace(User) || string.IsNullOrWhiteSpace(Password))
            {
                _logger.LogInformation("[EmailService] SMTP credentials not set. Simulated email sending to {To}: {Subject}", toEmail, subject);
                return true;
            }

            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(FromName, FromEmail));
                message.To.Add(new MailboxAddress(toName, toEmail));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = htmlBody
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                // If port 465 use SSL, if 587 use StartTls
                var secureOption = Port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
                await client.ConnectAsync(Host, Port, secureOption);
                await client.AuthenticateAsync(User, Password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("[EmailService] Email sent successfully to {To}", toEmail);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[EmailService] Error sending email to {To}: {Message}", toEmail, ex.Message);
                return false;
            }
        }

        public async Task<bool> SendOrderNotificationToAdminAsync(Order order)
        {
            var copCulture = new CultureInfo("es-CO");
            var itemsHtml = string.Join("", order.Items.Select(i =>
                $"<tr>" +
                $"<td style='padding: 8px; border-bottom: 1px solid #eee;'>{i.ProductName}</td>" +
                $"<td style='padding: 8px; border-bottom: 1px solid #eee; text-align: center;'>{i.Quantity}</td>" +
                $"<td style='padding: 8px; border-bottom: 1px solid #eee; text-align: right;'>{i.TotalPrice.ToString("C0", copCulture)}</td>" +
                $"</tr>"
            ));

            var html = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>
                <div style='text-align: center; border-bottom: 2px solid #e11d48; padding-bottom: 15px;'>
                    <h1 style='color: #e11d48; margin: 0;'>🌸 Nuevo Pedido Recibido</h1>
                    <p style='color: #64748b; font-size: 14px;'>Código: <strong>{order.OrderCode}</strong></p>
                </div>
                <div style='padding: 15px 0;'>
                    <h3 style='color: #1e293b; margin-top: 0;'>Datos del Cliente</h3>
                    <p style='margin: 4px 0;'><strong>Nombre:</strong> {order.CustomerName}</p>
                    <p style='margin: 4px 0;'><strong>Teléfono:</strong> <a href='tel:{order.CustomerPhone}'>{order.CustomerPhone}</a> (<a href='https://wa.me/{order.CustomerPhone.Replace("+", "").Replace(" ", "")}'>Abrir WhatsApp</a>)</p>
                    <p style='margin: 4px 0;'><strong>Email:</strong> {order.CustomerEmail}</p>
                    <p style='margin: 4px 0;'><strong>Dirección de Entrega:</strong> {order.DeliveryAddress}</p>
                    <p style='margin: 4px 0;'><strong>Fecha y Hora de Entrega:</strong> {order.DeliveryDate} - {order.DeliveryTime}</p>
                    {(string.IsNullOrWhiteSpace(order.CardMessage) ? "" : $"<p style='margin: 4px 0;'><strong>Mensaje para tarjeta:</strong> <em>\"{order.CardMessage}\"</em></p>")}
                    {(string.IsNullOrWhiteSpace(order.SpecialNotes) ? "" : $"<p style='margin: 4px 0;'><strong>Notas especiales:</strong> {order.SpecialNotes}</p>")}
                </div>
                <table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>
                    <thead>
                        <tr style='background: #f8fafc;'>
                            <th style='text-align: left; padding: 8px;'>Producto</th>
                            <th style='text-align: center; padding: 8px;'>Cant.</th>
                            <th style='text-align: right; padding: 8px;'>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan='2' style='padding: 12px 8px; font-weight: bold; text-align: right;'>TOTAL:</td>
                            <td style='padding: 12px 8px; font-weight: bold; text-align: right; color: #e11d48; font-size: 16px;'>{order.TotalAmount.ToString("C0", copCulture)}</td>
                        </tr>
                    </tfoot>
                </table>
                <div style='margin-top: 25px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 15px;'>
                    Florería La Carreta • Cra 49 # 131 Sur-69, Caldas, Antioquia • +57 320 646 8689
                </div>
            </div>";

            return await SendGenericEmailAsync(AdminEmail, "Admin La Carreta", $"[Nuevo Pedido] {order.OrderCode} - {order.CustomerName}", html);
        }

        public async Task<bool> SendOrderConfirmationToCustomerAsync(Order order)
        {
            if (string.IsNullOrWhiteSpace(order.CustomerEmail)) return true;

            var copCulture = new CultureInfo("es-CO");
            var itemsHtml = string.Join("", order.Items.Select(i =>
                $"<tr>" +
                $"<td style='padding: 8px; border-bottom: 1px solid #eee;'>{i.ProductName}</td>" +
                $"<td style='padding: 8px; border-bottom: 1px solid #eee; text-align: center;'>{i.Quantity}</td>" +
                $"<td style='padding: 8px; border-bottom: 1px solid #eee; text-align: right;'>{i.TotalPrice.ToString("C0", copCulture)}</td>" +
                $"</tr>"
            ));

            var html = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>
                <div style='text-align: center; border-bottom: 2px solid #e11d48; padding-bottom: 15px;'>
                    <h1 style='color: #e11d48; margin: 0;'>🌸 ¡Gracias por tu pedido!</h1>
                    <p style='color: #64748b; font-size: 14px;'>Florería La Carreta</p>
                </div>
                <div style='padding: 15px 0;'>
                    <p>Hola <strong>{order.CustomerName}</strong>,</p>
                    <p>Hemos recibido tu pedido con el código <strong>{order.OrderCode}</strong>. Estamos preparándolo con el mayor cuidado y cariño artesanal.</p>
                    <p style='margin: 4px 0;'><strong>Dirección de entrega:</strong> {order.DeliveryAddress}</p>
                    <p style='margin: 4px 0;'><strong>Fecha estimada:</strong> {order.DeliveryDate} ({order.DeliveryTime})</p>
                </div>
                <table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>
                    <thead>
                        <tr style='background: #f8fafc;'>
                            <th style='text-align: left; padding: 8px;'>Producto</th>
                            <th style='text-align: center; padding: 8px;'>Cant.</th>
                            <th style='text-align: right; padding: 8px;'>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan='2' style='padding: 12px 8px; font-weight: bold; text-align: right;'>TOTAL:</td>
                            <td style='padding: 12px 8px; font-weight: bold; text-align: right; color: #e11d48; font-size: 16px;'>{order.TotalAmount.ToString("C0", copCulture)}</td>
                        </tr>
                    </tfoot>
                </table>
                <p style='margin-top: 20px; font-size: 14px; color: #475569;'>Si tienes dudas o necesitas ajustar algún detalle, escríbenos directamente a nuestro WhatsApp: <a href='https://wa.me/573206468689' style='color: #e11d48; font-weight: bold;'>+57 320 646 8689</a>.</p>
                <div style='margin-top: 25px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 15px;'>
                    Florería La Carreta • Caldas, Antioquia • Cra 49 # 131 Sur-69
                </div>
            </div>";

            return await SendGenericEmailAsync(order.CustomerEmail, order.CustomerName, $"Confirmación de Pedido {order.OrderCode} - Florería La Carreta", html);
        }

        public async Task<bool> SendContactNotificationAsync(ContactMessageDto contact)
        {
            var html = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>
                <h2 style='color: #e11d48; margin-top: 0;'>💌 Nuevo Mensaje de Contacto</h2>
                <p><strong>Nombre:</strong> {contact.Name}</p>
                <p><strong>Email:</strong> {contact.Email}</p>
                <p><strong>Teléfono:</strong> {contact.Phone}</p>
                <p><strong>Asunto:</strong> {contact.Subject}</p>
                <div style='background: #f8fafc; padding: 12px; border-left: 4px solid #e11d48; margin-top: 15px;'>
                    <p style='margin: 0; white-space: pre-wrap;'>{contact.Message}</p>
                </div>
            </div>";

            return await SendGenericEmailAsync(AdminEmail, "Admin La Carreta", $"[Contacto Web] {contact.Subject} de {contact.Name}", html);
        }
    }
}
