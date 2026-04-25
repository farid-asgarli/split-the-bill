using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SplitTheBill.Api.Entities;

namespace SplitTheBill.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<Table> Tables => Set<Table>();
    public DbSet<TableSession> TableSessions => Set<TableSession>();
    public DbSet<Bill> Bills => Set<Bill>();
    public DbSet<BillItem> BillItems => Set<BillItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<NpsResponse> NpsResponses => Set<NpsResponse>();
    public DbSet<LoyaltyAccount> LoyaltyAccounts => Set<LoyaltyAccount>();
    public DbSet<LoyaltyTransaction> LoyaltyTransactions => Set<LoyaltyTransaction>();
    public DbSet<Reward> Rewards => Set<Reward>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApplicationUser>(e =>
        {
            e.HasOne(u => u.Restaurant)
                .WithMany()
                .HasForeignKey(u => u.RestaurantId);
        });

        modelBuilder.Entity<Restaurant>(e =>
        {
            e.HasKey(r => r.Id);
        });

        modelBuilder.Entity<Table>(e =>
        {
            e.HasKey(t => t.Id);
            e.HasOne(t => t.Restaurant).WithMany(r => r.Tables).HasForeignKey(t => t.RestaurantId);
        });

        modelBuilder.Entity<TableSession>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasOne(s => s.Table).WithMany(t => t.Sessions).HasForeignKey(s => s.TableId);
            e.HasOne(s => s.Bill)
                .WithOne(b => b.Session)
                .HasForeignKey<Bill>(b => b.TableSessionId);
        });

        modelBuilder.Entity<Bill>(e =>
        {
            e.HasKey(b => b.Id);
            e.Property(b => b.TaxRate).HasPrecision(5, 4);
            e.Property(b => b.ServiceChargeRate).HasPrecision(5, 4);
            e.Property(b => b.Status).HasConversion<string>().HasMaxLength(20);
        });

        modelBuilder.Entity<BillItem>(e =>
        {
            e.HasKey(i => i.Id);
            e.HasOne(i => i.Bill).WithMany(b => b.Items).HasForeignKey(i => i.BillId);
        });

        modelBuilder.Entity<Payment>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasOne(p => p.Bill).WithMany(b => b.Payments).HasForeignKey(p => p.BillId);
            e.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);
        });

        modelBuilder.Entity<NpsResponse>(e =>
        {
            e.HasKey(n => n.Id);
            e.HasOne(n => n.Restaurant).WithMany().HasForeignKey(n => n.RestaurantId);
            e.HasOne(n => n.Payment).WithMany().HasForeignKey(n => n.PaymentId);
        });

        modelBuilder.Entity<LoyaltyAccount>(e =>
        {
            e.HasKey(la => la.Id);
            e.HasIndex(la => la.Email).IsUnique();
        });

        modelBuilder.Entity<LoyaltyTransaction>(e =>
        {
            e.HasKey(lt => lt.Id);
            e.HasOne(lt => lt.Account).WithMany(la => la.Transactions).HasForeignKey(lt => lt.LoyaltyAccountId);
            e.HasOne(lt => lt.Restaurant).WithMany().HasForeignKey(lt => lt.RestaurantId);
            e.HasOne(lt => lt.Payment).WithMany().HasForeignKey(lt => lt.PaymentId);
        });

        modelBuilder.Entity<Reward>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasOne(r => r.Restaurant).WithMany(rest => rest.Rewards).HasForeignKey(r => r.RestaurantId);
        });
    }
}
