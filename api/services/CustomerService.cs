using api.Data;
using Microsoft.EntityFrameworkCore;
using api.models;

namespace api.services;

public record SetCustomerRequest(string CustomerCode, string FirstName, string LastName, string Company, string Email, bool ActiveStatus);

public record ListCustomerRequest(int Page, int PageSize, string SortColumn, string SortDirection, string? Search = null, bool? ActiveStatus = true);

public record PaginatedCustomerResponse(List<AppDbContext.Customer> Data, Pagination Pagination);

public class CustomerService(AppDbContext _context)
{
    public async Task<AppDbContext.Customer> CreateCustomer(SetCustomerRequest customerRequest)
    {
        var customer = new AppDbContext.Customer
        {
            CustomerCode = customerRequest.CustomerCode,
            FirstName = customerRequest.FirstName,
            LastName = customerRequest.LastName,
            Company = customerRequest.Company,
            Email = customerRequest.Email,
            ActiveStatus = customerRequest.ActiveStatus,
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Customers.Add(customer);

        try
        {
            await _context.SaveChangesAsync();
            return customer;
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("customers_customer_code_key") == true)
        {
            throw new InvalidOperationException($"Customer code '{customerRequest.CustomerCode}' already exists.");
        }
    }


    public async Task<PaginatedCustomerResponse> ListCustomers(ListCustomerRequest listCustomerRequest)
    {

        var search = listCustomerRequest.Search;
        var activeStatus = listCustomerRequest.ActiveStatus;
        var pageSize = listCustomerRequest.PageSize;
        var page = listCustomerRequest.Page;
        var sortColumn = listCustomerRequest.SortColumn;
        var sortDirection = listCustomerRequest.SortDirection;

        var query = _context.Customers.AsQueryable();

        query = query.Where(c => c.Status == "Active");

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c =>
                c.CustomerCode.Contains(search) ||
                c.FirstName.Contains(search) ||
                c.LastName.Contains(search) ||
                c.Company.Contains(search) ||
                c.Email.Contains(search));
        }

        if (activeStatus.HasValue)
        {
            query = query.Where(c => c.ActiveStatus == activeStatus);
        }

        if (!string.IsNullOrEmpty(sortColumn))
        {

            var pascalCaseSortColumn = char.ToUpper(sortColumn[0]) + sortColumn[1..].ToLower();

            var property = typeof(AppDbContext.Customer).GetProperty(pascalCaseSortColumn,
                System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);

            if (property != null)
            {
                var isDescending = sortDirection?.ToLower() == "desc";
                query = isDescending
                    ? query.OrderByDescending(c => EF.Property<object>(c, property.Name))
                    : query.OrderBy(c => EF.Property<object>(c, property.Name));
            }
        }

        var totalCount = await query.CountAsync();

        var customers = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var pagination = new Pagination
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };

        return new PaginatedCustomerResponse(customers, pagination);
    }


    public async Task<AppDbContext.Customer?> GetCustomer(string id)
    {
        return await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
    }

}