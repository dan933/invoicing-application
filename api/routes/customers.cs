namespace api.routes;

using System.Security.Claims;
using api.services;

public static class CustomerRoutes
{

    public static void MapCustomerEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/customers/list", async (ListCustomerRequest request, CustomerService service, PermissionService permissionService, ClaimsPrincipal user) =>
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


            return Results.Ok(await service.ListCustomers(request));

        }).RequireAuthorization();

        endpoints.MapPost("/customers/create", async (SetCustomerRequest request, CustomerService service, PermissionService permissionService, ClaimsPrincipal user) =>
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

            try
            {
                return Results.Ok(await service.CreateCustomer(request));
            }
            catch (InvalidOperationException ex)
            {
                return Results.Problem(ex.Message, statusCode: 409); // 409 Conflict for duplicate
            }

        }).RequireAuthorization();

        endpoints.MapPost("/customers/update/{id}", async (string id, SetCustomerRequest request, CustomerService service, PermissionService permissionService, ClaimsPrincipal user) =>
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

                    try
                    {
                        return Results.Ok(await service.UpdateCustomer(id, request));
                    }
                    catch (InvalidOperationException ex)
                    {
                        return Results.Problem(ex.Message, statusCode: 409); // 409 Conflict for duplicate
                    }

                }).RequireAuthorization();

        endpoints.MapDelete("/customers/delete/{id}", async (string id, CustomerService service, PermissionService permissionService, ClaimsPrincipal user) =>
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

            try
            {
                var customer = await service.DeleteCustomer(id);
                return Results.Ok(customer);
            }
            catch (InvalidOperationException ex)
            {
                return Results.Problem(ex.Message, statusCode: 409); // 409 Conflict for duplicate
            }

        }).RequireAuthorization();

        endpoints.MapGet("/customers/get/{id}", async (string id, CustomerService service, PermissionService permissionService, ClaimsPrincipal user) =>
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


            var customer = await service.GetCustomer(id);
            return customer != null ? Results.Ok(customer) : Results.NotFound();
        }).RequireAuthorization();
    }
}
