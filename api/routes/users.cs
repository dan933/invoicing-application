namespace api.routes;

using api.services;

public record SetUserPermissionRequest(Guid UserId, string PermissionName);
public record CreateUserRequest(string Email, string Password);

public static class UserRoutes
{

    public static void MapUserEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/users", async (UserService service) => await service.GetAllUsers());
        endpoints.MapPost("/users/user/create", async (CreateUserRequest request, UserService service) =>
        {
            try
            {
                var result = await service.CreateUser(request.Email, request.Password);
                return Results.Ok(new { success = true, Message = "Sign up successfull" });
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(ex.Message);
            }
            catch (InvalidOperationException)
            {
                return Results.Ok(new { success = true, Message = "Sign up successfull" });
            }
        });
        endpoints.MapPost("/users/user/permission/set", async (SetUserPermissionRequest request, PermissionService service) => await service.SetPermission(request.UserId, request.PermissionName));

    }
}
