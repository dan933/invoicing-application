using Microsoft.EntityFrameworkCore;

namespace api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Permission> Permissions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<User>().Property(e => e.Id).HasColumnName("id");
        modelBuilder.Entity<User>().Property(e => e.Status).HasColumnName("status");
        modelBuilder.Entity<User>().Property(e => e.Email).HasColumnName("email");
        modelBuilder.Entity<User>().Property(e => e.PasswordHash).HasColumnName("passwordhash");
        modelBuilder.Entity<User>().Property(e => e.CreatedAt).HasColumnName("createdat").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<User>().Property(e => e.Updated).HasColumnName("updated").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        modelBuilder.Entity<Permission>().ToTable("permissions");
        modelBuilder.Entity<Permission>().Property(e => e.Id).HasColumnName("id");
        modelBuilder.Entity<Permission>().Property(e => e.PermissionName).HasColumnName("permission_name");
        modelBuilder.Entity<Permission>().Property(e => e.UserId).HasColumnName("userid");
        modelBuilder.Entity<Permission>().Property(e => e.CreatedAt).HasColumnName("createdat").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<Permission>().Property(e => e.Updated).HasColumnName("updated").HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        modelBuilder.Entity<Permission>().HasIndex(e => new { e.PermissionName, e.UserId }).IsUnique();
        modelBuilder.Entity<Permission>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(p => p.UserId);

    }

    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Status { get; set; } = "Active";
        public string Email { get; set; } = "";
        public string PasswordHash { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime Updated { get; set; } = DateTime.UtcNow;
    }


    public class Permission
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string PermissionName { get; set; } = "";
        public Guid UserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime Updated { get; set; } = DateTime.UtcNow;
    }
}
