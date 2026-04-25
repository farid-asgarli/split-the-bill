namespace SplitTheBill.Api.Dtos;

public record NpsSubmitRequest(Guid PaymentId, int Rating, string? Comment);

public record NpsResponseDto(Guid Id, int Rating, string? Comment, string CreatedAt);

public record LoyaltySignupRequest(string Email, string? Name, string? Phone);

public record LoyaltyAccountDto(
    Guid Id,
    string Email,
    string? Name,
    int TotalPoints,
    string CreatedAt,
    List<LoyaltyTransactionDto> RecentTransactions
);

public record LoyaltyTransactionDto(
    Guid Id,
    string RestaurantName,
    int Points,
    string Description,
    string CreatedAt
);

public record RewardDto(Guid Id, string Title, string? Description, int PointsCost);

public record RedeemRewardRequest(Guid RewardId);
