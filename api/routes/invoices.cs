namespace api.routes;

using System.Security.Claims;
using api.services;
using api.models;

public static class InvoiceRoutes
{
    public static void MapInvoiceEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/invoices/create", async (SetInvoiceRequest request, InvoiceService service, PermissionService permissionService, ClaimsPrincipal user) =>
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


            return Results.Ok(await service.CreateInvoice(request));

        }).RequireAuthorization();

        endpoints.MapPost("/invoices/list", async (PagedInvoiceRequest request, InvoiceService service, PermissionService permissionService, ClaimsPrincipal user) =>
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

            return Results.Ok(await service.ListInvoices(request));
        }).RequireAuthorization();

        endpoints.MapGet("/invoices/{id}", async (Guid id, InvoiceService service, PermissionService permissionService, ClaimsPrincipal user) =>
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

            return Results.Ok(await service.GetInvoice(id));
        }).RequireAuthorization();
    }
};
