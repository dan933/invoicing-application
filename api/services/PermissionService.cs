using api.Data;
using Microsoft.EntityFrameworkCore;
using api.models;

namespace api.services;

public record SetPermissionRequest(Guid UserId, string PermissionName);


public class PermissionService(AppDbContext _context)
{

    public async Task<List<Permission>> GetAllPermissions()
    {
        return await _context.Permissions.ToListAsync();
    }

    public async Task<Permission> SetPermission(Guid userId, string permissionName)
    {

        //Check user exists
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId) ?? throw new KeyNotFoundException("User not found");

        var existingPermission = await _context.Permissions.FirstOrDefaultAsync(p => p.UserId == userId && p.PermissionName == permissionName);

        if (existingPermission != null)
        {
            return existingPermission;
        }


        var permission = new Permission
        {
            PermissionName = permissionName,
            UserId = userId
        };

        _context.Permissions.Add(permission);
        await _context.SaveChangesAsync();

        return permission;
    }

    public async Task<Boolean> HasPermission(Guid userId, string permissionName)
    {
        var permission = await _context.Permissions.FirstOrDefaultAsync(p => p.UserId == userId && p.PermissionName == permissionName);

        return permission != null;
    }
}