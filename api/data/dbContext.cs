using Microsoft.EntityFrameworkCore;
using api.models;

namespace api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceItem> InvoiceItems { get; set; }
    public DbSet<InvoiceSummary> InvoiceSummaries { get; set; }
    public DbSet<InvoiceCount> InvoiceCounts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<User>().Property(e => e.Id).HasColumnName("id").HasColumnType("uuid");
        modelBuilder.Entity<User>().Property(e => e.Status).HasColumnName("status");
        modelBuilder.Entity<User>().Property(e => e.Email).HasColumnName("email");
        modelBuilder.Entity<User>().Property(e => e.PasswordHash).HasColumnName("password_hash");
        modelBuilder.Entity<User>().Property(e => e.CreatedAt).HasColumnName("created_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<User>().Property(e => e.UpdatedAt).HasColumnName("updated_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        modelBuilder.Entity<Permission>().ToTable("permissions");
        modelBuilder.Entity<Permission>().Property(e => e.Id).HasColumnName("id").HasColumnType("uuid");
        modelBuilder.Entity<Permission>().Property(e => e.PermissionName).HasColumnName("permission_name");
        modelBuilder.Entity<Permission>().Property(e => e.UserId).HasColumnName("user_id");
        modelBuilder.Entity<Permission>().Property(e => e.CreatedAt).HasColumnName("created_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<Permission>().Property(e => e.UpdatedAt).HasColumnName("updated_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<Permission>().HasIndex(e => new { e.PermissionName, e.UserId }).IsUnique();
        modelBuilder.Entity<Permission>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(p => p.UserId);

        modelBuilder.Entity<Customer>().ToTable("customers");
        modelBuilder.Entity<Customer>().Property(e => e.Id).HasColumnName("id").HasColumnType("uuid"); ;
        modelBuilder.Entity<Customer>().Property(e => e.Status).HasColumnName("status");
        modelBuilder.Entity<Customer>().Property(e => e.CustomerCode).HasColumnName("customer_code");
        modelBuilder.Entity<Customer>().Property(e => e.FirstName).HasColumnName("first_name");
        modelBuilder.Entity<Customer>().Property(e => e.LastName).HasColumnName("last_name");
        modelBuilder.Entity<Customer>().Property(e => e.Company).HasColumnName("company");
        modelBuilder.Entity<Customer>().Property(e => e.Email).HasColumnName("email");
        modelBuilder.Entity<Customer>().Property(e => e.ActiveStatus).HasColumnName("active_status");
        modelBuilder.Entity<Customer>().Property(e => e.CreatedAt).HasColumnName("created_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<Customer>().Property(e => e.UpdatedAt).HasColumnName("updated_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        modelBuilder.Entity<Invoice>().ToTable("invoices");
        modelBuilder.Entity<Invoice>().Property(e => e.Id).HasColumnName("id").HasColumnType("uuid");
        modelBuilder.Entity<Invoice>().Property(e => e.Status).HasColumnName("status");
        modelBuilder.Entity<Invoice>().Property(e => e.CustomerId).HasColumnName("customer_id");
        modelBuilder.Entity<Invoice>().Property(e => e.InvoiceReference).HasColumnName("invoice_reference").ValueGeneratedOnAdd();
        modelBuilder.Entity<Invoice>().Property(e => e.InvoiceDate).HasColumnName("invoice_date").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<Invoice>().Property(e => e.DueDate).HasColumnName("due_date").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<Invoice>().Property(e => e.Gst).HasColumnName("gst");
        modelBuilder.Entity<Invoice>().Property(e => e.Paid).HasColumnName("paid");
        modelBuilder.Entity<Invoice>().Property(e => e.CreatedAt).HasColumnName("created_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<Invoice>().Property(e => e.UpdatedAt).HasColumnName("updated_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<Invoice>()
            .HasOne<Customer>()
            .WithMany()
            .HasForeignKey(i => i.CustomerId);

        modelBuilder.Entity<InvoiceItem>().ToTable("invoice_items");
        modelBuilder.Entity<InvoiceItem>().Property(e => e.Id).HasColumnName("id").HasColumnType("uuid");
        modelBuilder.Entity<InvoiceItem>().Property(e => e.InvoiceId).HasColumnName("invoice_id");
        modelBuilder.Entity<InvoiceItem>().Property(e => e.Description).HasColumnName("description");
        modelBuilder.Entity<InvoiceItem>().Property(e => e.Quantity).HasColumnName("quantity");
        modelBuilder.Entity<InvoiceItem>().Property(e => e.UnitPrice).HasColumnName("unit_price");
        modelBuilder.Entity<InvoiceItem>().Property(e => e.TotalPrice).HasColumnName("total_price");
        modelBuilder.Entity<InvoiceItem>().Property(e => e.CreatedAt).HasColumnName("created_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<InvoiceItem>().Property(e => e.UpdatedAt).HasColumnName("updated_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<InvoiceItem>()
            .HasOne<Invoice>()
            .WithMany()
            .HasForeignKey(i => i.InvoiceId);

        modelBuilder.Entity<InvoiceSummary>().ToView("invoice_summaries");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.Id).HasColumnName("id");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.CustomerId).HasColumnName("customer_id");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.CustomerCode).HasColumnName("customer_code");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.FirstName).HasColumnName("first_name");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.LastName).HasColumnName("last_name");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.Company).HasColumnName("company");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.Email).HasColumnName("email");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.InvoiceReference).HasColumnName("invoice_reference");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.Status).HasColumnName("status");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.InvoiceDate).HasColumnName("invoice_date");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.DueDate).HasColumnName("due_date");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.TotalPrice).HasColumnName("total_price");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.Gst).HasColumnName("gst");
        modelBuilder.Entity<InvoiceSummary>().Property(e => e.Paid).HasColumnName("paid");
        modelBuilder.Entity<InvoiceSummary>().HasNoKey();


        modelBuilder.Entity<InvoiceCount>().ToView("invoice_count");
        modelBuilder.Entity<InvoiceCount>().Property(e => e.OutstandingCount).HasColumnName("outstanding_count");
        modelBuilder.Entity<InvoiceCount>().Property(e => e.OverdueCount).HasColumnName("overdue_count");
        modelBuilder.Entity<InvoiceCount>().HasNoKey();



    }

}
