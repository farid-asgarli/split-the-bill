using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SplitTheBill.Api.Services;

public class SseConnectionManager
{
    private readonly ConcurrentDictionary<string, ConcurrentBag<StreamWriter>> _connections = new();

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public void AddConnection(string tableId, StreamWriter writer)
    {
        var bag = _connections.GetOrAdd(tableId, _ => []);
        bag.Add(writer);
    }

    public void RemoveConnection(string tableId, StreamWriter writer)
    {
        if (_connections.TryGetValue(tableId, out var bag))
        {
            // ConcurrentBag doesn't support removal; rebuild
            var remaining = new ConcurrentBag<StreamWriter>(bag.Where(w => w != writer));
            _connections.TryUpdate(tableId, remaining, bag);
        }
    }

    public async Task BroadcastAsync(string tableId, string eventType, object data)
    {
        if (!_connections.TryGetValue(tableId, out var bag))
            return;

        var json = JsonSerializer.Serialize(data, JsonOptions);
        var message = $"event: {eventType}\ndata: {json}\n\n";

        var deadWriters = new List<StreamWriter>();
        foreach (var writer in bag)
        {
            try
            {
                await writer.WriteAsync(message);
                await writer.FlushAsync();
            }
            catch
            {
                deadWriters.Add(writer);
            }
        }

        foreach (var dead in deadWriters)
            RemoveConnection(tableId, dead);
    }
}
