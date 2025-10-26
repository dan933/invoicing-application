using api.Data;
using Microsoft.EntityFrameworkCore;
using api.models;
using System.ComponentModel.DataAnnotations;

namespace api.services;

public class UserService(AppDbContext _context)
{

    public async Task<List<UserDto>> GetAllUsers()
    {
        return await _context.Users
    .Select(u => new UserDto { Id = u.Id, Status = u.Status, Email = u.Email, CreatedAt = u.CreatedAt, Updated = u.UpdatedAt })
    .ToListAsync();
    }

    public async Task<UserDto> CreateUser(string email, string password)
    {

        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            throw new ArgumentException("Email and password are required");

        if (password.Length < 5)
            throw new ArgumentException("Password must be at least 8 characters long");


        if (!new EmailAddressAttribute().IsValid(email))
            throw new ArgumentException("Invalid email format");

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (existingUser != null)
            throw new InvalidOperationException("Email already exists");

        var user = new User
        {
            Email = email,
            PasswordHash = hashedPassword
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            Status = user.Status,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            Updated = user.UpdatedAt
        };
    }

    public async Task<UserDto> SetPassword(string email, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email) ?? throw new KeyNotFoundException("User not found");

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        user.PasswordHash = hashedPassword;
        user.UpdatedAt = DateTime.UtcNow;

        _context.Users.Update(user);

        await _context.SaveChangesAsync();

        return new UserDto { Id = user.Id, Status = user.Status, Email = user.Email, CreatedAt = user.CreatedAt, Updated = user.UpdatedAt };


    }
}