using Microsoft.EntityFrameworkCore;

namespace api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<Customer> Customers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<User>().Property(e => e.Id).HasColumnName("id");
        modelBuilder.Entity<User>().Property(e => e.Status).HasColumnName("status");
        modelBuilder.Entity<User>().Property(e => e.Email).HasColumnName("email");
        modelBuilder.Entity<User>().Property(e => e.PasswordHash).HasColumnName("password_hash");
        modelBuilder.Entity<User>().Property(e => e.CreatedAt).HasColumnName("created_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<User>().Property(e => e.UpdatedAt).HasColumnName("updated_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        modelBuilder.Entity<Permission>().ToTable("permissions");
        modelBuilder.Entity<Permission>().Property(e => e.Id).HasColumnName("id");
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
        modelBuilder.Entity<Customer>().Property(e => e.Id).HasColumnName("id");
        modelBuilder.Entity<Customer>().Property(e => e.Status).HasColumnName("status");
        modelBuilder.Entity<Customer>().Property(e => e.CustomerCode).HasColumnName("customer_code");
        modelBuilder.Entity<Customer>().Property(e => e.FirstName).HasColumnName("first_name");
        modelBuilder.Entity<Customer>().Property(e => e.LastName).HasColumnName("last_name");
        modelBuilder.Entity<Customer>().Property(e => e.Company).HasColumnName("company");
        modelBuilder.Entity<Customer>().Property(e => e.Email).HasColumnName("email");
        modelBuilder.Entity<Customer>().Property(e => e.ActiveStatus).HasColumnName("active_status");
        modelBuilder.Entity<Customer>().Property(e => e.CreatedAt).HasColumnName("created_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<Customer>().Property(e => e.UpdatedAt).HasColumnName("updated_at").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
    }

    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Status { get; set; } = "Active";
        public string Email { get; set; } = "";
        public string PasswordHash { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }


    public class Permission
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string PermissionName { get; set; } = "";
        public Guid UserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Customer
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
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
}
