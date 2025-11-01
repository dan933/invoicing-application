using api.Data;
using Microsoft.EntityFrameworkCore;
using api.models;

namespace api.services;


public record PaginatedInvoicesResponse(List<InvoiceSummary> Data, Pagination Pagination);


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


    public async Task<InvoiceWithItems> UpdateInvoice(Guid id, SetInvoiceRequest invoiceRequest)
    {
        var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id) ?? throw new KeyNotFoundException("Invoice not found");

        invoice.CustomerId = invoiceRequest.CustomerId;
        invoice.InvoiceDate = invoiceRequest.InvoiceDate;
        invoice.DueDate = invoiceRequest.DueDate;
        invoice.Gst = invoiceRequest.Gst;
        invoice.Paid = invoiceRequest.Paid;
        invoice.UpdatedAt = DateTime.UtcNow;

        // Get line item documents
        var existingItems = await _context.InvoiceItems.Where(ii => ii.InvoiceId == id).ToListAsync();

        //Remove existing items
        _context.InvoiceItems.RemoveRange(existingItems);

        //Add new items
        var invoiceItems = new List<InvoiceItem>();

        foreach (var item in invoiceRequest.LineItems)
        {
            var invoiceItem = new InvoiceItem
            {
                InvoiceId = id,
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

        _context.InvoiceItems.AddRange(invoiceItems);

        //save changes
        await _context.SaveChangesAsync();

        return new InvoiceWithItems(invoice, invoiceItems);
    }

    public class DeleteInvoiceResponse
    {
        public Guid Id { get; set; }
    };


    public async Task<DeleteInvoiceResponse> DeleteInvoice(Guid id)
    {
        var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id) ?? throw new KeyNotFoundException("Invoice not found");

        var invoiceItems = await _context.InvoiceItems.Where(ii => ii.InvoiceId == id).ToListAsync();

        _context.InvoiceItems.RemoveRange(invoiceItems);

        invoice.Status = "Deleted";
        invoice.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = new DeleteInvoiceResponse { Id = invoice.Id };

        return response;
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

    public async Task<InvoiceDetails> GetInvoice(Guid invoiceId)
    {
        var invoice = await _context.InvoiceSummaries.Select(item => new
        {
            item.Id,
            item.InvoiceReference,
            item.CustomerCode,
            item.CustomerId,
            item.Company,
            CustomerName = $"{item.FirstName ?? ""} {item.LastName ?? ""}".Trim(),
            CompanyName = item.Company,
            item.Email,
            item.InvoiceDate,
            SubTotal = item.TotalPrice,
            item.Paid,
            item.Gst,
            item.DueDate,
        })
            .FirstOrDefaultAsync(i => i.Id == invoiceId) ?? throw new InvalidOperationException($"Invoice with ID '{invoiceId}' not found.");


        var invoiceItems = await _context.InvoiceItems
            .Where(i => i.InvoiceId == invoiceId).Select(i => new InvoiceItemDto
            {
                Id = i.Id,
                Description = i.Description,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice
            })
            .ToListAsync();


        var invoiceDetails = new InvoiceDetails
        {
            Id = invoice.Id,
            InvoiceReference = invoice.InvoiceReference,
            CustomerCode = invoice.CustomerCode,
            CustomerId = invoice.CustomerId,
            CustomerName = invoice.CustomerName,
            CompanyName = invoice.CompanyName,
            Email = invoice.Email,
            InvoiceDate = invoice.InvoiceDate,
            DueDate = invoice.DueDate,
            SubTotal = invoice.SubTotal,
            Paid = invoice.Paid,
            Gst = invoice.Gst,
            LineItems = invoiceItems
        };

        return invoiceDetails;
    }

}