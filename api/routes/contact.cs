namespace api.routes;

using api.services;

public static class ContactRoutes
{



    public static void MapContactEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/contact/send", async (ContactRequest request, EmailService emailService) =>
        {
            var subject = $"Contact Form: {request.Subject}";
            var htmlContent = $@"
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> {request.Name}</p>
                <p><strong>Email:</strong> {request.Email}</p>
                <p><strong>Subject:</strong> {request.Subject}</p>
                <p><strong>Message:</strong></p>
                <p>{request.Message}</p>";

            var success = await emailService.SendEmailAsync(emailService.AdminEmail, subject, htmlContent);

            return success ? Results.Ok(new { message = "Email sent successfully" })
                          : Results.BadRequest(new { message = "Failed to send email" });
        });
    }
}

public record ContactRequest(string Name, string Email, string Subject, string Message);
