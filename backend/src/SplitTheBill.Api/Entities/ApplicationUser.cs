using Microsoft.AspNetCore.Identity;

namespace SplitTheBill.Api.Entities;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string RestaurantId { get; set; } = string.Empty;

    public Restaurant Restaurant { get; set; } = null!;
}
