namespace SplitTheBill.Api.Entities;

public class LoyaltyAccount
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public int TotalPoints { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<LoyaltyTransaction> Transactions { get; set; } = [];
}
