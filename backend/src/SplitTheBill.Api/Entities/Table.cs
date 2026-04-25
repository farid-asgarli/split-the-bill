namespace SplitTheBill.Api.Entities;

public class Table
{
    public string Id { get; set; } = string.Empty;
    public int Number { get; set; }
    public string RestaurantId { get; set; } = string.Empty;

    public Restaurant Restaurant { get; set; } = null!;
    public List<TableSession> Sessions { get; set; } = [];
}
