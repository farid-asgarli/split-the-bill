namespace SplitTheBill.Api.Entities;

public enum PaymentStatus
{
    Pending,
    Succeeded,
    Failed,
}

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string BillId { get; set; } = string.Empty;
    public int Amount { get; set; } // minor units
    public int TipAmount { get; set; }
    public string SplitMode { get; set; } = "none"; // none, equal, by_item, custom
    public string? ItemIds { get; set; } // JSON array of item IDs, nullable
    public string? StripePaymentIntentId { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Bill Bill { get; set; } = null!;
}
