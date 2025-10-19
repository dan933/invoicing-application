namespace api.routes;

using api.services;

public record LoginRequest(string Email, string Password);

public static class AuthRoutes
{

    public static void MapAuthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/auth/login", async (LoginRequest request, AuthService service) =>
        {
            var token = await service.Login(request.Email, request.Password);
            return token != null ? Results.Ok(new { Token = token }) : Results.Unauthorized();
        });

    }
}
