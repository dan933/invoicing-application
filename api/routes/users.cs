namespace api.routes;

using System.Security.Claims;
using api.services;

public record SetUserPermissionRequest(Guid UserId, string PermissionName);
public record CreateUserRequest(string Email, string Password);

public static class UserRoutes
{

    public static void MapUserEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/users", async (UserService service, PermissionService permissionService, ClaimsPrincipal user) =>
        {

            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Results.Unauthorized();
            }

            var hasAdminPermission = await permissionService.HasPermission(userId, "Admin");
            if (!hasAdminPermission)
            {
                return Results.Forbid();
            }


            return Results.Ok(await service.GetAllUsers());

        }).RequireAuthorization();
        endpoints.MapPost("/users/user/create", async (CreateUserRequest request, UserService service, PermissionService permissionService, ClaimsPrincipal user) =>
        {
            try
            {

                var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Results.Unauthorized();
                }

                var hasAdminPermission = await permissionService.HasPermission(userId, "admin");
                if (!hasAdminPermission)
                {
                    return Results.Forbid();
                }



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
        }).RequireAuthorization();
        endpoints.MapPost("/users/user/setPassword", async (CreateUserRequest request, UserService service) =>
        {
            await service.SetPassword(request.Email, request.Password);

            return Results.Ok(new { success = true, Message = "Password set successfully" });

        });
        endpoints.MapPost("/users/user/permission/set", async (SetUserPermissionRequest request, PermissionService permissionService, ClaimsPrincipal user) =>
        {

            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Results.Unauthorized();
            }

            var hasAdminPermission = await permissionService.HasPermission(userId, "admin");
            if (!hasAdminPermission)
            {
                return Results.Forbid();
            }


            return Results.Ok(await permissionService.SetPermission(request.UserId, request.PermissionName));

        }).RequireAuthorization();

    }
}
