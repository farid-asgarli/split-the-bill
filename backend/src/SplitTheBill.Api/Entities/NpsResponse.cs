namespace SplitTheBill.Api.Entities;

public class NpsResponse
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string RestaurantId { get; set; } = string.Empty;
    public Guid PaymentId { get; set; }
    public int Rating { get; set; } // 1-5 stars
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Restaurant Restaurant { get; set; } = null!;
    public Payment Payment { get; set; } = null!;
}
