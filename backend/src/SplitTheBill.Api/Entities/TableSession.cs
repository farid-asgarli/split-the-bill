namespace SplitTheBill.Api.Entities;

public class TableSession
{
    public string Id { get; set; } = string.Empty; // session token
    public string TableId { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }

    public Table Table { get; set; } = null!;
    public Bill? Bill { get; set; }
}
