using SplitTheBill.Api.Services;

namespace SplitTheBill.Api.Endpoints;

public static class BillEndpoints
{
    public static void MapBillEndpoints(this WebApplication app)
    {
        app.MapGet(
            "/api/bill/{tableId}",
            async (string tableId, string? session, BillService billService) =>
            {
                var result = await billService.GetBillByTableIdAsync(tableId, session);
                return result is not null
                    ? Results.Ok(result)
                    : Results.NotFound(new { error = "Table not found or session expired" });
            }
        );
    }
}
