namespace api.models;

public class UserDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = "";
    public string Email { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime Updated { get; set; }
}