using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SplitTheBill.Api.Data;
using SplitTheBill.Api.Entities;

namespace SplitTheBill.Api.Endpoints;

public static class AdminTableEndpoints
{
    public static void MapAdminTableEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin/tables").RequireAuthorization();

        group.MapGet(
            "/",
            async (ClaimsPrincipal principal, AppDbContext db) =>
            {
                var restaurantId = principal.FindFirstValue("restaurantId");
                var tables = await db
                    .Tables.Where(t => t.RestaurantId == restaurantId)
                    .Select(t => new
                    {
                        t.Id,
                        t.Number,
                        HasActiveSession = t.Sessions.Any(s => s.IsActive),
                    })
                    .OrderBy(t => t.Number)
                    .ToListAsync();

                return Results.Ok(tables);
            }
        );

        group.MapPost(
            "/",
            async (CreateTableRequest request, ClaimsPrincipal principal, AppDbContext db) =>
            {
                var restaurantId = principal.FindFirstValue("restaurantId")!;

                var exists = await db.Tables.AnyAsync(t =>
                    t.RestaurantId == restaurantId && t.Number == request.Number
                );
                if (exists)
                    return Results.Conflict(
                        new { error = $"Table {request.Number} already exists" }
                    );

                var table = new Table
                {
                    Id = $"tbl_{Guid.NewGuid():N}"[..12],
                    Number = request.Number,
                    RestaurantId = restaurantId,
                };

                db.Tables.Add(table);
                await db.SaveChangesAsync();

                return Results.Created(
                    $"/api/admin/tables/{table.Id}",
                    new
                    {
                        table.Id,
                        table.Number,
                        HasActiveSession = false,
                    }
                );
            }
        );

        group.MapDelete(
            "/{id}",
            async (string id, ClaimsPrincipal principal, AppDbContext db) =>
            {
                var restaurantId = principal.FindFirstValue("restaurantId");
                var table = await db
                    .Tables.Include(t => t.Sessions)
                    .FirstOrDefaultAsync(t => t.Id == id && t.RestaurantId == restaurantId);

                if (table is null)
                    return Results.NotFound(new { error = "Table not found" });

                if (table.Sessions.Any(s => s.IsActive))
                    return Results.Conflict(
                        new { error = "Cannot delete a table with an active session" }
                    );

                db.Tables.Remove(table);
                await db.SaveChangesAsync();

                return Results.NoContent();
            }
        );
    }
}

public record CreateTableRequest(int Number);
