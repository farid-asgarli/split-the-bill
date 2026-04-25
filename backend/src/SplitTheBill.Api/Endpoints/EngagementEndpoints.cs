using Microsoft.EntityFrameworkCore;
using SplitTheBill.Api.Data;
using SplitTheBill.Api.Dtos;
using SplitTheBill.Api.Entities;

namespace SplitTheBill.Api.Endpoints;

public static class EngagementEndpoints
{
    public static void MapEngagementEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/engagement");

        // Submit NPS rating
        group.MapPost(
            "/nps",
            async (NpsSubmitRequest req, AppDbContext db) =>
            {
                var payment = await db
                    .Payments.Include(p => p.Bill)
                    .ThenInclude(b => b.Session)
                    .ThenInclude(s => s.Table)
                    .FirstOrDefaultAsync(p => p.Id == req.PaymentId);

                if (payment is null)
                    return Results.NotFound(new { error = "Payment not found" });

                if (req.Rating < 1 || req.Rating > 5)
                    return Results.BadRequest(new { error = "Rating must be between 1 and 5" });

                var nps = new NpsResponse
                {
                    RestaurantId = payment.Bill.Session.Table.RestaurantId,
                    PaymentId = payment.Id,
                    Rating = req.Rating,
                    Comment = req.Comment,
                };

                db.NpsResponses.Add(nps);
                await db.SaveChangesAsync();

                return Results.Ok(
                    new NpsResponseDto(nps.Id, nps.Rating, nps.Comment, nps.CreatedAt.ToString("O"))
                );
            }
        );

        // Loyalty: sign up or get account
        group.MapPost(
            "/loyalty/signup",
            async (LoyaltySignupRequest req, AppDbContext db) =>
            {
                var existing = await db.LoyaltyAccounts.FirstOrDefaultAsync(a =>
                    a.Email == req.Email
                );
                if (existing is not null)
                {
                    var txns = await db
                        .LoyaltyTransactions.Where(t => t.LoyaltyAccountId == existing.Id)
                        .OrderByDescending(t => t.CreatedAt)
                        .Take(10)
                        .Include(t => t.Restaurant)
                        .ToListAsync();

                    return Results.Ok(
                        new LoyaltyAccountDto(
                            existing.Id,
                            existing.Email,
                            existing.Name,
                            existing.TotalPoints,
                            existing.CreatedAt.ToString("O"),
                            txns.Select(t => new LoyaltyTransactionDto(
                                    t.Id,
                                    t.Restaurant.Name,
                                    t.Points,
                                    t.Description,
                                    t.CreatedAt.ToString("O")
                                ))
                                .ToList()
                        )
                    );
                }

                var account = new LoyaltyAccount
                {
                    Email = req.Email,
                    Name = req.Name,
                    Phone = req.Phone,
                };
                db.LoyaltyAccounts.Add(account);
                await db.SaveChangesAsync();

                return Results.Created(
                    $"/api/engagement/loyalty/{account.Id}",
                    new LoyaltyAccountDto(
                        account.Id,
                        account.Email,
                        account.Name,
                        0,
                        account.CreatedAt.ToString("O"),
                        []
                    )
                );
            }
        );

        // Loyalty: get account by email
        group.MapGet(
            "/loyalty/{email}",
            async (string email, AppDbContext db) =>
            {
                var account = await db.LoyaltyAccounts.FirstOrDefaultAsync(a => a.Email == email);
                if (account is null)
                    return Results.NotFound(new { error = "Account not found" });

                var txns = await db
                    .LoyaltyTransactions.Where(t => t.LoyaltyAccountId == account.Id)
                    .OrderByDescending(t => t.CreatedAt)
                    .Take(10)
                    .Include(t => t.Restaurant)
                    .ToListAsync();

                return Results.Ok(
                    new LoyaltyAccountDto(
                        account.Id,
                        account.Email,
                        account.Name,
                        account.TotalPoints,
                        account.CreatedAt.ToString("O"),
                        txns.Select(t => new LoyaltyTransactionDto(
                                t.Id,
                                t.Restaurant.Name,
                                t.Points,
                                t.Description,
                                t.CreatedAt.ToString("O")
                            ))
                            .ToList()
                    )
                );
            }
        );

        // Loyalty: earn points from a payment
        group.MapPost(
            "/loyalty/earn",
            async (LoyaltyEarnRequest req, AppDbContext db) =>
            {
                var account = await db.LoyaltyAccounts.FirstOrDefaultAsync(a =>
                    a.Email == req.Email
                );
                if (account is null)
                    return Results.NotFound(new { error = "Loyalty account not found" });

                var payment = await db
                    .Payments.Include(p => p.Bill)
                    .ThenInclude(b => b.Session)
                    .ThenInclude(s => s.Table)
                    .FirstOrDefaultAsync(p => p.Id == req.PaymentId);

                if (payment is null)
                    return Results.NotFound(new { error = "Payment not found" });

                // 1 point per 100 minor units (e.g. 1 point per ₼1)
                var points = payment.Amount / 100;

                var txn = new LoyaltyTransaction
                {
                    LoyaltyAccountId = account.Id,
                    RestaurantId = payment.Bill.Session.Table.RestaurantId,
                    PaymentId = payment.Id,
                    Points = points,
                    Description =
                        $"Earned from payment at {payment.Bill.Session.Table.RestaurantId}",
                };

                account.TotalPoints += points;
                db.LoyaltyTransactions.Add(txn);
                await db.SaveChangesAsync();

                return Results.Ok(new { pointsEarned = points, totalPoints = account.TotalPoints });
            }
        );

        // Rewards: list available for a restaurant
        group.MapGet(
            "/rewards/{restaurantId}",
            async (string restaurantId, AppDbContext db) =>
            {
                var rewards = await db
                    .Rewards.Where(r => r.RestaurantId == restaurantId && r.IsActive)
                    .OrderBy(r => r.PointsCost)
                    .ToListAsync();

                return Results.Ok(
                    rewards.Select(r => new RewardDto(r.Id, r.Title, r.Description, r.PointsCost))
                );
            }
        );

        // Rewards: redeem
        group.MapPost(
            "/loyalty/{email}/redeem",
            async (string email, RedeemRewardRequest req, AppDbContext db) =>
            {
                var account = await db.LoyaltyAccounts.FirstOrDefaultAsync(a => a.Email == email);
                if (account is null)
                    return Results.NotFound(new { error = "Loyalty account not found" });

                var reward = await db.Rewards.FirstOrDefaultAsync(r =>
                    r.Id == req.RewardId && r.IsActive
                );
                if (reward is null)
                    return Results.NotFound(new { error = "Reward not found" });

                if (account.TotalPoints < reward.PointsCost)
                    return Results.BadRequest(new { error = "Insufficient points" });

                var txn = new LoyaltyTransaction
                {
                    LoyaltyAccountId = account.Id,
                    RestaurantId = reward.RestaurantId,
                    Points = -reward.PointsCost,
                    Description = $"Redeemed: {reward.Title}",
                };

                account.TotalPoints -= reward.PointsCost;
                db.LoyaltyTransactions.Add(txn);
                await db.SaveChangesAsync();

                return Results.Ok(
                    new
                    {
                        redeemed = reward.Title,
                        pointsSpent = reward.PointsCost,
                        totalPoints = account.TotalPoints,
                    }
                );
            }
        );
    }
}

public record LoyaltyEarnRequest(string Email, Guid PaymentId);
