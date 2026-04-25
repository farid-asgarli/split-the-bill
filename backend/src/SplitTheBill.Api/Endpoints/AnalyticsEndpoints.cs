using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SplitTheBill.Api.Data;
using SplitTheBill.Api.Entities;

namespace SplitTheBill.Api.Endpoints;

public static class AnalyticsEndpoints
{
    public static void MapAnalyticsEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin/analytics").RequireAuthorization();

        // Overview: key metrics summary
        group.MapGet(
            "/overview",
            async (ClaimsPrincipal principal, AppDbContext db) =>
            {
                var restaurantId = principal.FindFirstValue("restaurantId")!;
                var now = DateTime.UtcNow;
                var thirtyDaysAgo = now.AddDays(-30);
                var sevenDaysAgo = now.AddDays(-7);

                var payments = await db
                    .Payments.Where(p =>
                        p.Bill.Session.Table.RestaurantId == restaurantId
                        && p.Status == PaymentStatus.Succeeded
                    )
                    .Select(p => new
                    {
                        p.Amount,
                        p.TipAmount,
                        p.SplitMode,
                        p.CreatedAt,
                    })
                    .ToListAsync();

                var recentPayments = payments.Where(p => p.CreatedAt >= thirtyDaysAgo).ToList();
                var lastWeekPayments = payments.Where(p => p.CreatedAt >= sevenDaysAgo).ToList();

                var totalRevenue = recentPayments.Sum(p => p.Amount);
                var totalTips = recentPayments.Sum(p => p.TipAmount);
                var avgTipPercent = recentPayments
                    .Where(p => p.Amount > 0)
                    .Select(p => (double)p.TipAmount / p.Amount * 100)
                    .DefaultIfEmpty(0)
                    .Average();
                var paymentCount = recentPayments.Count;

                // NPS average
                var npsAvg =
                    await db
                        .NpsResponses.Where(n =>
                            n.RestaurantId == restaurantId && n.CreatedAt >= thirtyDaysAgo
                        )
                        .Select(n => (double?)n.Rating)
                        .AverageAsync() ?? 0;

                var npsCount = await db
                    .NpsResponses.Where(n =>
                        n.RestaurantId == restaurantId && n.CreatedAt >= thirtyDaysAgo
                    )
                    .CountAsync();

                return Results.Ok(
                    new
                    {
                        period = "30d",
                        totalRevenue,
                        totalTips,
                        avgTipPercent = Math.Round(avgTipPercent, 1),
                        paymentCount,
                        npsAverage = Math.Round(npsAvg, 1),
                        npsCount,
                        splitUsage = new
                        {
                            none = recentPayments.Count(p => p.SplitMode == "none"),
                            equal = recentPayments.Count(p => p.SplitMode == "equal"),
                            byItem = recentPayments.Count(p => p.SplitMode == "by_item"),
                            custom = recentPayments.Count(p => p.SplitMode == "custom"),
                        },
                    }
                );
            }
        );

        // Tip analytics with benchmarks
        group.MapGet(
            "/tips",
            async (ClaimsPrincipal principal, AppDbContext db) =>
            {
                var restaurantId = principal.FindFirstValue("restaurantId")!;
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

                var payments = await db
                    .Payments.Where(p =>
                        p.Bill.Session.Table.RestaurantId == restaurantId
                        && p.Status == PaymentStatus.Succeeded
                        && p.CreatedAt >= thirtyDaysAgo
                    )
                    .Select(p => new
                    {
                        p.Amount,
                        p.TipAmount,
                        p.CreatedAt,
                    })
                    .ToListAsync();

                var tippedPayments = payments.Where(p => p.TipAmount > 0).ToList();
                var tipOptInRate =
                    payments.Count > 0 ? (double)tippedPayments.Count / payments.Count * 100 : 0;
                var avgTipPercent = tippedPayments
                    .Where(p => p.Amount > 0)
                    .Select(p => (double)p.TipAmount / p.Amount * 100)
                    .DefaultIfEmpty(0)
                    .Average();
                var totalTips = payments.Sum(p => p.TipAmount);

                // Daily breakdown for chart
                var dailyTips = payments
                    .GroupBy(p => p.CreatedAt.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new
                    {
                        date = g.Key.ToString("yyyy-MM-dd"),
                        totalTips = g.Sum(p => p.TipAmount),
                        avgPercent = g.Where(p => p.Amount > 0)
                            .Select(p => (double)p.TipAmount / p.Amount * 100)
                            .DefaultIfEmpty(0)
                            .Average(),
                        count = g.Count(),
                    })
                    .ToList();

                return Results.Ok(
                    new
                    {
                        tipOptInRate = Math.Round(tipOptInRate, 1),
                        avgTipPercent = Math.Round(avgTipPercent, 1),
                        totalTips,
                        benchmarkAvgPercent = 18.0, // industry benchmark
                        dailyTips,
                    }
                );
            }
        );

        // Payment volume heatmap (hour of day × day of week)
        group.MapGet(
            "/heatmap",
            async (ClaimsPrincipal principal, AppDbContext db) =>
            {
                var restaurantId = principal.FindFirstValue("restaurantId")!;
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

                var payments = await db
                    .Payments.Where(p =>
                        p.Bill.Session.Table.RestaurantId == restaurantId
                        && p.Status == PaymentStatus.Succeeded
                        && p.CreatedAt >= thirtyDaysAgo
                    )
                    .Select(p => new { p.CreatedAt, p.Amount })
                    .ToListAsync();

                var heatmap = payments
                    .GroupBy(p => new
                    {
                        DayOfWeek = (int)p.CreatedAt.DayOfWeek,
                        Hour = p.CreatedAt.Hour,
                    })
                    .Select(g => new
                    {
                        day = g.Key.DayOfWeek,
                        hour = g.Key.Hour,
                        count = g.Count(),
                        volume = g.Sum(p => p.Amount),
                    })
                    .OrderBy(h => h.day)
                    .ThenBy(h => h.hour)
                    .ToList();

                return Results.Ok(new { heatmap });
            }
        );

        // NPS / customer satisfaction
        group.MapGet(
            "/nps",
            async (ClaimsPrincipal principal, AppDbContext db) =>
            {
                var restaurantId = principal.FindFirstValue("restaurantId")!;
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

                var responses = await db
                    .NpsResponses.Where(n =>
                        n.RestaurantId == restaurantId && n.CreatedAt >= thirtyDaysAgo
                    )
                    .Select(n => new
                    {
                        n.Rating,
                        n.Comment,
                        n.CreatedAt,
                    })
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                var distribution = Enumerable
                    .Range(1, 5)
                    .Select(r => new { rating = r, count = responses.Count(n => n.Rating == r) })
                    .ToList();

                return Results.Ok(
                    new
                    {
                        average = responses.Count > 0
                            ? Math.Round(responses.Average(r => r.Rating), 1)
                            : 0,
                        total = responses.Count,
                        distribution,
                        recentComments = responses
                            .Where(r => r.Comment != null)
                            .Take(20)
                            .Select(r => new
                            {
                                r.Rating,
                                r.Comment,
                                date = r.CreatedAt.ToString("yyyy-MM-dd"),
                            }),
                    }
                );
            }
        );

        // Table turnover metrics
        group.MapGet(
            "/tables",
            async (ClaimsPrincipal principal, AppDbContext db) =>
            {
                var restaurantId = principal.FindFirstValue("restaurantId")!;
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

                var sessions = await db
                    .TableSessions.Where(s =>
                        s.Table.RestaurantId == restaurantId && s.CreatedAt >= thirtyDaysAgo
                    )
                    .Select(s => new
                    {
                        s.TableId,
                        tableNumber = s.Table.Number,
                        s.CreatedAt,
                        s.IsActive,
                        hasBill = s.Bill != null,
                        paidAt = s.Bill != null
                            ? s
                                .Bill.Payments.Where(p => p.Status == PaymentStatus.Succeeded)
                                .OrderByDescending(p => p.CreatedAt)
                                .Select(p => (DateTime?)p.CreatedAt)
                                .FirstOrDefault()
                            : null,
                    })
                    .ToListAsync();

                var completedSessions = sessions.Where(s => s.paidAt.HasValue).ToList();
                var avgTurnoverMinutes =
                    completedSessions.Count > 0
                        ? completedSessions.Average(s =>
                            (s.paidAt!.Value - s.CreatedAt).TotalMinutes
                        )
                        : 0;

                var perTable = sessions
                    .GroupBy(s => new { s.TableId, s.tableNumber })
                    .Select(g => new
                    {
                        tableNumber = g.Key.tableNumber,
                        sessionCount = g.Count(),
                        avgMinutes = g.Where(s => s.paidAt.HasValue)
                            .Select(s => (s.paidAt!.Value - s.CreatedAt).TotalMinutes)
                            .DefaultIfEmpty(0)
                            .Average(),
                    })
                    .OrderBy(t => t.tableNumber)
                    .ToList();

                return Results.Ok(
                    new
                    {
                        avgTurnoverMinutes = Math.Round(avgTurnoverMinutes, 0),
                        totalSessions = sessions.Count,
                        completedSessions = completedSessions.Count,
                        perTable,
                    }
                );
            }
        );
    }
}
