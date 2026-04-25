namespace SplitTheBill.Api.Entities;

public class BillItem
{
    public string Id { get; set; } = string.Empty;
    public string BillId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // starters, mains, desserts, drinks
    public int Quantity { get; set; }
    public int UnitPrice { get; set; } // minor units

    public Bill Bill { get; set; } = null!;
}
