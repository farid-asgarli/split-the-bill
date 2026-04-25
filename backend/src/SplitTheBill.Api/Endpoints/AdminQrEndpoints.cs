using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SplitTheBill.Api.Data;
using SplitTheBill.Api.Entities;
using SplitTheBill.Api.Services;

namespace SplitTheBill.Api.Endpoints;

public static class AdminQrEndpoints
{
    public static void MapAdminQrEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin/tables").RequireAuthorization();

        group.MapGet(
            "/{tableId}/qr",
            async (
                string tableId,
                string? format,
                ClaimsPrincipal principal,
                AppDbContext db,
                QrCodeService qrService
            ) =>
            {
                var restaurantId = principal.FindFirstValue("restaurantId");
                var table = await db
                    .Tables.Include(t => t.Sessions)
                    .FirstOrDefaultAsync(t => t.Id == tableId && t.RestaurantId == restaurantId);

                if (table is null)
                    return Results.NotFound(new { error = "Table not found" });

                var activeSession = table.Sessions.FirstOrDefault(s => s.IsActive);
                if (activeSession is null)
                {
                    activeSession = new TableSession
                    {
                        Id = $"sess_{Guid.NewGuid():N}"[..16],
                        TableId = tableId,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                    };
                    db.TableSessions.Add(activeSession);
                    await db.SaveChangesAsync();
                }

                if (format == "svg")
                {
                    var svg = qrService.GenerateQrCodeSvg(tableId, activeSession.Id);
                    return Results.Content(svg, "image/svg+xml");
                }

                var png = qrService.GenerateQrCode(tableId, activeSession.Id);
                return Results.File(png, "image/png", $"table-{table.Number}-qr.png");
            }
        );

        group.MapPost(
            "/{tableId}/session/reset",
            async (
                string tableId,
                ClaimsPrincipal principal,
                AppDbContext db,
                QrCodeService qrService
            ) =>
            {
                var restaurantId = principal.FindFirstValue("restaurantId");
                var table = await db
                    .Tables.Include(t => t.Sessions)
                    .FirstOrDefaultAsync(t => t.Id == tableId && t.RestaurantId == restaurantId);

                if (table is null)
                    return Results.NotFound(new { error = "Table not found" });

                // Deactivate all existing sessions
                foreach (var s in table.Sessions.Where(s => s.IsActive))
                    s.IsActive = false;

                // Create new session
                var newSession = new TableSession
                {
                    Id = $"sess_{Guid.NewGuid():N}"[..16],
                    TableId = tableId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                };
                db.TableSessions.Add(newSession);
                await db.SaveChangesAsync();

                return Results.Ok(new { sessionId = newSession.Id });
            }
        );
    }
}
