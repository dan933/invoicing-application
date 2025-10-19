namespace api.routes;

using api.services;

public static class PermissionRoutes
{

    public static void MapPermissionsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/permissions/list", async (PermissionService service) => await service.GetAllPermissions());
    }
}
