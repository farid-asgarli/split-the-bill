using Microsoft.EntityFrameworkCore;
using SplitTheBill.Api.Data;
using SplitTheBill.Api.Services;

namespace SplitTheBill.Api.Endpoints;

public static class QrEndpoints
{
    public static void MapQrEndpoints(this WebApplication app)
    {
        app.MapGet(
            "/api/qr/{tableId}",
            async (string tableId, AppDbContext db, QrCodeService qrService) =>
            {
                var session = await db.TableSessions.FirstOrDefaultAsync(s =>
                    s.TableId == tableId && s.IsActive
                );

                if (session is null)
                    return Results.NotFound(new { error = "No active session for this table" });

                var png = qrService.GenerateQrCode(tableId, session.Id);
                return Results.File(png, "image/png");
            }
        );
    }
}
