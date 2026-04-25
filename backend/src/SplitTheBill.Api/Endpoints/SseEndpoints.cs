using SplitTheBill.Api.Services;

namespace SplitTheBill.Api.Endpoints;

public static class SseEndpoints
{
    public static void MapSseEndpoints(this WebApplication app)
    {
        app.MapGet(
            "/api/bill/{tableId}/events",
            async (
                string tableId,
                HttpContext context,
                SseConnectionManager sse,
                CancellationToken ct
            ) =>
            {
                context.Response.Headers.ContentType = "text/event-stream";
                context.Response.Headers.CacheControl = "no-cache";
                context.Response.Headers.Connection = "keep-alive";

                var writer = new StreamWriter(context.Response.Body) { AutoFlush = true };
                sse.AddConnection(tableId, writer);

                // Send initial heartbeat
                await writer.WriteAsync(": connected\n\n");
                await writer.FlushAsync();

                try
                {
                    // Keep alive until client disconnects
                    await Task.Delay(Timeout.Infinite, ct);
                }
                catch (OperationCanceledException)
                {
                    // Client disconnected
                }
                finally
                {
                    sse.RemoveConnection(tableId, writer);
                }
            }
        );
    }
}
