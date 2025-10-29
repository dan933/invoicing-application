using api.Data;
using Microsoft.EntityFrameworkCore;
using api.models;

namespace api.services;

public class InvoiceService(AppDbContext _context)
{

    public record InvoiceWithItems(Invoice Invoice, List<InvoiceItem> InvoiceItems);


    public async Task<InvoiceWithItems> CreateInvoice(SetInvoiceRequest invoiceRequest)
    {
        var invoice = new Invoice
        {
            CustomerId = invoiceRequest.CustomerId,
            InvoiceDate = invoiceRequest.InvoiceDate,
            DueDate = invoiceRequest.DueDate,
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Invoices.Add(invoice);

        var invoiceItems = new List<InvoiceItem>();

        foreach (var item in invoiceRequest.LineItems)
        {
            var invoiceItem = new InvoiceItem
            {
                InvoiceId = invoice.Id,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.TotalPrice,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.InvoiceItems.Add(invoiceItem);

            invoiceItems.Add(invoiceItem);
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("customers_customer_code_key") == true)
        {
            throw new InvalidOperationException($"Invoice Reference '{invoice.InvoiceReference}' already exists.");
        }


        return new InvoiceWithItems(invoice, invoiceItems);
    }

}