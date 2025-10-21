using api.Data;
using Microsoft.EntityFrameworkCore;
using api.models;

namespace api.services;

public record SetCustomerRequest(string CustomerCode, string FirstName, string LastName, string Company, string Email, bool ActiveStatus);


public record PaginatedCustomerResponse(List<AppDbContext.Customer> Data, Pagination Pagination);

public class CustomerService(AppDbContext _context)
{
    public async Task<AppDbContext.Customer> CreateCustomer(string customerCode, string firstName, string lastName, string company, string email, bool activeStatus)
    {
        var customer = new AppDbContext.Customer
        {
            CustomerCode = customerCode,
            FirstName = firstName,
            LastName = lastName,
            Company = company,
            Email = email,
            ActiveStatus = activeStatus
        };

        _context.Customers.Add(customer);

        await _context.SaveChangesAsync();

        return customer;
    }

    public async Task<PaginatedCustomerResponse> ListCustomers(int page, int pageSize, string sortColumn, string sortDirection, string? search = null)
    {

        var query = _context.Customers.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c =>
                c.CustomerCode.Contains(search) ||
                c.FirstName.Contains(search) ||
                c.LastName.Contains(search) ||
                c.Company.Contains(search) ||
                c.Email.Contains(search));
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


    public async Task<AppDbContext.Customer?> GetCustomer(Guid id)
    {
        return await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
    }

}