namespace SplitTheBill.Api.Entities;

public class Reward
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string RestaurantId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty; // e.g. "10% off your next visit"
    public string? Description { get; set; }
    public int PointsCost { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Restaurant Restaurant { get; set; } = null!;
}
