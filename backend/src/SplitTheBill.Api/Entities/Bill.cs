namespace SplitTheBill.Api.Entities;

public enum BillStatus
{
    Open,
    Partial,
    Paid,
}

public class Bill
{
    public string Id { get; set; } = string.Empty;
    public string TableSessionId { get; set; } = string.Empty;
    public BillStatus Status { get; set; } = BillStatus.Open;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Currency { get; set; } = "AZN";
    public string TaxLabel { get; set; } = string.Empty;
    public decimal TaxRate { get; set; }
    public string ServiceChargeLabel { get; set; } = string.Empty;
    public decimal ServiceChargeRate { get; set; }

    public TableSession Session { get; set; } = null!;
    public List<BillItem> Items { get; set; } = [];
    public List<Payment> Payments { get; set; } = [];
}
