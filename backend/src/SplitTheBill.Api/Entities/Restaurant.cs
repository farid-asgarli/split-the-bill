namespace SplitTheBill.Api.Entities;

public class Restaurant
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Logo { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? GooglePlaceId { get; set; }

    public List<Table> Tables { get; set; } = [];
    public List<Reward> Rewards { get; set; } = [];
}
