using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SplitTheBill.Api.Entities;

namespace SplitTheBill.Api.Data;

public static class Seed
{
    public static async Task SeedDataAsync(
        AppDbContext db,
        UserManager<ApplicationUser> userManager
    )
    {
        if (await db.Restaurants.AnyAsync())
            return;

        var restaurant = new Restaurant
        {
            Id = "rst_01",
            Name = "The Amber Room",
            Logo = "/mock/restaurant-logo.png",
            Address = "12 Neftçilər prospekti, Bakı 1001",
            GooglePlaceId = null,
        };

        var table = new Table
        {
            Id = "tbl_07",
            Number = 7,
            RestaurantId = restaurant.Id,
        };

        var session = new TableSession
        {
            Id = "sess_abc123",
            TableId = table.Id,
            IsActive = true,
            CreatedAt = new DateTime(2026, 4, 25, 19, 30, 0, DateTimeKind.Utc),
        };

        var bill = new Bill
        {
            Id = "bill_20260425_007",
            TableSessionId = session.Id,
            Status = BillStatus.Open,
            CreatedAt = new DateTime(2026, 4, 25, 19, 30, 0, DateTimeKind.Utc),
            Currency = "AZN",
            TaxLabel = "ƏDV (18%)",
            TaxRate = 0.18m,
            ServiceChargeLabel = "Service charge (10%)",
            ServiceChargeRate = 0.10m,
        };

        var items = new List<BillItem>
        {
            new()
            {
                Id = "item_01",
                BillId = bill.Id,
                Name = "Truffle Mushroom Soup",
                Category = "starters",
                Quantity = 2,
                UnitPrice = 450,
            },
            new()
            {
                Id = "item_02",
                BillId = bill.Id,
                Name = "Burrata & Heirloom Tomato",
                Category = "starters",
                Quantity = 1,
                UnitPrice = 650,
            },
            new()
            {
                Id = "item_03",
                BillId = bill.Id,
                Name = "Pan-Seared Sea Bass",
                Category = "mains",
                Quantity = 1,
                UnitPrice = 1200,
            },
            new()
            {
                Id = "item_04",
                BillId = bill.Id,
                Name = "Wagyu Steak (200g)",
                Category = "mains",
                Quantity = 1,
                UnitPrice = 2800,
            },
            new()
            {
                Id = "item_05",
                BillId = bill.Id,
                Name = "Wild Mushroom Risotto",
                Category = "mains",
                Quantity = 1,
                UnitPrice = 950,
            },
            new()
            {
                Id = "item_06",
                BillId = bill.Id,
                Name = "Tiramisu",
                Category = "desserts",
                Quantity = 2,
                UnitPrice = 550,
            },
            new()
            {
                Id = "item_07",
                BillId = bill.Id,
                Name = "Crème Brûlée",
                Category = "desserts",
                Quantity = 1,
                UnitPrice = 500,
            },
            new()
            {
                Id = "item_08",
                BillId = bill.Id,
                Name = "Sparkling Water (750ml)",
                Category = "drinks",
                Quantity = 2,
                UnitPrice = 250,
            },
            new()
            {
                Id = "item_09",
                BillId = bill.Id,
                Name = "House Red Wine (glass)",
                Category = "drinks",
                Quantity = 3,
                UnitPrice = 700,
            },
            new()
            {
                Id = "item_10",
                BillId = bill.Id,
                Name = "Espresso",
                Category = "drinks",
                Quantity = 2,
                UnitPrice = 200,
            },
        };

        db.Restaurants.Add(restaurant);
        db.Tables.Add(table);
        db.TableSessions.Add(session);
        db.Bills.Add(bill);
        db.BillItems.AddRange(items);

        // Seed rewards
        var rewards = new List<Reward>
        {
            new()
            {
                RestaurantId = restaurant.Id,
                Title = "10% off your next visit",
                Description = "Get 10% off your entire bill on your next visit",
                PointsCost = 500,
            },
            new()
            {
                RestaurantId = restaurant.Id,
                Title = "Free dessert",
                Description = "Enjoy a complimentary dessert of your choice",
                PointsCost = 300,
            },
            new()
            {
                RestaurantId = restaurant.Id,
                Title = "Complimentary welcome drink",
                Description = "Start your meal with a drink on the house",
                PointsCost = 150,
            },
        };
        db.Rewards.AddRange(rewards);

        await db.SaveChangesAsync();

        // Seed admin user
        if (await userManager.FindByEmailAsync("admin@amberroom.com") is null)
        {
            var adminUser = new ApplicationUser
            {
                UserName = "admin@amberroom.com",
                Email = "admin@amberroom.com",
                FullName = "Admin Manager",
                RestaurantId = restaurant.Id,
                EmailConfirmed = true,
            };
            await userManager.CreateAsync(adminUser, "Admin123!");
        }
    }
}
