using api.Data;
using Microsoft.EntityFrameworkCore;
using api.models;

namespace api.services;


public record PaginatedCustomerResponse(List<Customer> Data, Pagination Pagination);

public class CustomerService(AppDbContext _context)
{
    public async Task<Customer> CreateCustomer(SetCustomerRequest customerRequest)
    {
        var customer = new Customer
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


    public async Task<Customer> UpdateCustomer(Guid id, SetCustomerRequest customerRequest)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id) ?? throw new KeyNotFoundException("Customer not found");

        customer.CustomerCode = customerRequest.CustomerCode;
        customer.FirstName = customerRequest.FirstName;
        customer.LastName = customerRequest.LastName;
        customer.Company = customerRequest.Company;
        customer.Email = customerRequest.Email;
        customer.ActiveStatus = customerRequest.ActiveStatus;
        customer.UpdatedAt = DateTime.UtcNow;

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


    public async Task<Customer> DeleteCustomer(Guid id)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id) ?? throw new KeyNotFoundException("Customer not found");

        try
        {

            customer.Status = "Deleted";
            customer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return customer;
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("customers_customer_code_key") == true)
        {
            throw new InvalidOperationException($"Customer code '{customer.CustomerCode}' already exists.");
        }
    }

    public async Task<PaginatedCustomerResponse> ListCustomers(PagedRequest listCustomerRequest)
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
               EF.Functions.ILike(c.CustomerCode, $"%{search}%") ||
               EF.Functions.ILike(c.FirstName, $"%{search}%") ||
               EF.Functions.ILike(c.LastName, $"%{search}%") ||
               EF.Functions.ILike(c.Company, $"%{search}%") ||
               EF.Functions.ILike(c.Email, $"%{search}%"));
        }

        if (activeStatus.HasValue)
        {
            query = query.Where(c => c.ActiveStatus == activeStatus);
        }

        if (!string.IsNullOrEmpty(sortColumn))
        {

            var pascalCaseSortColumn = char.ToUpper(sortColumn[0]) + sortColumn[1..].ToLower();

            var property = typeof(Customer).GetProperty(pascalCaseSortColumn,
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


    public async Task<Customer?> GetCustomer(Guid id)
    {
        return await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
    }

}