using Microsoft.EntityFrameworkCore;

namespace api.models;

public class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Status { get; set; } = "";
    public string CustomerCode { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Company { get; set; } = "";
    public string Email { get; set; } = "";
    public bool ActiveStatus { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class SetCustomerRequest
{
    public string CustomerCode { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Company { get; set; } = "";
    public string Email { get; set; } = "";
    public bool ActiveStatus { get; set; } = true;
}

[Keyless]
public class CustomerSummary : Customer
{
    public int OutstandingCount { get; set; }
    public int OverdueCount { get; set; }
}