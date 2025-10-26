namespace api.models;

public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Status { get; set; } = "";
    public Guid CustomerId { get; set; } = Guid.NewGuid();
    public string InvoiceReference { get; set; } = "";
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class InvoiceItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InvoiceId { get; set; } = Guid.NewGuid();
    public string Description { get; set; } = "";
    public int Quantity { get; set; } = 0;
    public int UnitPrice { get; set; } = 0;
    public int TotalPrice { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class InvoiceItemDto
{
    public string Description { get; set; } = "";
    public int Quantity { get; set; } = 0;
    public int UnitPrice { get; set; } = 0;
    public int TotalPrice { get; set; } = 0;
}


public class SetInvoiceRequest
{
    public Guid CustomerId { get; set; } = Guid.NewGuid();
    public string InvoiceReference { get; set; } = "";
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; } = DateTime.UtcNow;

    public List<InvoiceItemDto> Items { get; set; } = [];
}