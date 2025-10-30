namespace api.models;

public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Status { get; set; } = "";
    public Guid CustomerId { get; set; } = Guid.NewGuid();
    public int InvoiceReference { get; set; } = 0;
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; } = DateTime.UtcNow;
    public bool Gst { get; set; } = false;
    public bool Paid { get; set; } = false;
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
    public bool Gst { get; set; } = false;
    public bool Paid { get; set; } = false;
    public List<InvoiceItemDto> LineItems { get; set; } = [];
}


public class InvoiceSummary
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerCode { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Company { get; set; } = "";
    public string Email { get; set; } = "";
    public int InvoiceReference { get; set; }
    public string Status { get; set; } = "";
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public long TotalPrice { get; set; }
    public bool Gst { get; set; }
    public bool Paid { get; set; }
}
