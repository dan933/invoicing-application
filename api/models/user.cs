namespace api.models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Status { get; set; } = "Active";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}


public class UserDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = "";
    public string Email { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime Updated { get; set; }
}


public class Permission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PermissionName { get; set; } = "";
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}