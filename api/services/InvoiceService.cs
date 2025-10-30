using api.Data;
using Microsoft.EntityFrameworkCore;
using api.models;

namespace api.services;


public record PaginatedInvoicesResponse(List<InvoiceSummary> Data, Pagination Pagination);

public class PagedInvoiceRequest : PagedRequest
{
    public Guid CustomerId { get; set; }
    public DateTime? InvoiceDateFrom { get; set; }
    public DateTime? InvoiceDateTo { get; set; }
}

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
            Gst = invoiceRequest.Gst,
            Paid = invoiceRequest.Paid,
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


    public async Task<PaginatedInvoicesResponse> ListInvoices(PagedInvoiceRequest listInvoiceRequest)
    {
        var search = listInvoiceRequest.Search;
        var activeStatus = listInvoiceRequest.ActiveStatus;
        var pageSize = listInvoiceRequest.PageSize;
        var page = listInvoiceRequest.Page;
        var sortColumn = listInvoiceRequest.SortColumn;
        var sortDirection = listInvoiceRequest.SortDirection;

        var query = _context.InvoiceSummaries.AsQueryable();

        if (listInvoiceRequest.CustomerId != Guid.Empty)
        {
            query = query.Where(i => i.CustomerId == listInvoiceRequest.CustomerId);
        }


        query = query.Where(i => i.Status == "Active");

        if (listInvoiceRequest.InvoiceDateFrom.HasValue)
        {
            query = query.Where(i => i.InvoiceDate >= listInvoiceRequest.InvoiceDateFrom.Value);
        }

        if (listInvoiceRequest.InvoiceDateTo.HasValue)
        {
            query = query.Where(i => i.InvoiceDate <= listInvoiceRequest.InvoiceDateTo.Value);
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(i =>
               EF.Functions.ILike(i.CustomerCode, $"%{search}%") ||
               EF.Functions.ILike(i.FirstName, $"%{search}%") ||
               EF.Functions.ILike(i.LastName, $"%{search}%") ||
               EF.Functions.ILike(i.Company, $"%{search}%") ||
               EF.Functions.ILike(i.Email, $"%{search}%") ||
               i.InvoiceReference.ToString().Contains(search));
        }

        if (!string.IsNullOrEmpty(sortColumn))
        {
            var pascalCaseSortColumn = char.ToUpper(sortColumn[0]) + sortColumn[1..].ToLower();
            var property = typeof(InvoiceSummary).GetProperty(pascalCaseSortColumn,
                System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);

            if (property != null)
            {
                var isDescending = sortDirection?.ToLower() == "desc";
                query = isDescending
                    ? query.OrderByDescending(i => EF.Property<object>(i, property.Name))
                    : query.OrderBy(i => EF.Property<object>(i, property.Name));
            }
        }

        var totalCount = await query.CountAsync();

        var invoices = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var pagination = new Pagination
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };

        return new PaginatedInvoicesResponse(invoices, pagination);
    }
}