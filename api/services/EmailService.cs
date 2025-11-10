using SendGrid;
using SendGrid.Helpers.Mail;

namespace api.services;

public class EmailService
{
    private readonly ISendGridClient _sendGridClient;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly string _adminEmail;


    public EmailService(IConfiguration configuration)
    {
        var apiKey = configuration["SendGrid:ApiKey"];
        _sendGridClient = new SendGridClient(apiKey);
        _fromEmail = configuration["SendGrid:FromEmail"]!;
        _fromName = configuration["SendGrid:FromName"]!;
        _adminEmail = configuration["SendGrid:AdminEmail"]!;
    }

    public string AdminEmail => _adminEmail;

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlContent)
    {
        var from = new EmailAddress(_fromEmail, _fromName);
        var to = new EmailAddress(toEmail);
        var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlContent);

        var response = await _sendGridClient.SendEmailAsync(msg);
        return response.IsSuccessStatusCode;
    }
}
