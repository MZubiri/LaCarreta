using FloreriaApi.DTOs;
using FloreriaApi.Models;

namespace FloreriaApi.Services
{
    public interface IEmailService
    {
        Task<bool> SendOrderNotificationToAdminAsync(Order order);
        Task<bool> SendOrderConfirmationToCustomerAsync(Order order);
        Task<bool> SendContactNotificationAsync(ContactMessageDto contact);
        Task<bool> SendGenericEmailAsync(string toEmail, string toName, string subject, string htmlBody);
    }
}
