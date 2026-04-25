namespace SplitTheBill.Api.Entities;

public class LoyaltyTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LoyaltyAccountId { get; set; }
    public string RestaurantId { get; set; } = string.Empty;
    public Guid? PaymentId { get; set; }
    public int Points { get; set; } // positive = earned, negative = redeemed
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public LoyaltyAccount Account { get; set; } = null!;
    public Restaurant Restaurant { get; set; } = null!;
    public Payment? Payment { get; set; }
}
