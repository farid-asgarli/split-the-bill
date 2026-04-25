using System.Text.Json.Serialization;

namespace SplitTheBill.Api.Dtos;

public record BillResponseDto(RestaurantDto Restaurant, TableDto Table, BillDto Bill);

public record RestaurantDto(string Id, string Name, string Logo, string Address, string? GooglePlaceId);

public record TableDto(string Id, int Number, string Session);

public record BillDto(
    string Id,
    string Status,
    string CreatedAt,
    string Currency,
    List<BillItemDto> Items,
    int Subtotal,
    TaxInfoDto Tax,
    ServiceChargeDto ServiceCharge,
    int Total,
    int AmountPaid,
    int AmountRemaining,
    List<string>? PaidItemIds = null,
    List<string>? LockedItemIds = null
);

public record BillItemDto(
    string Id,
    string Name,
    string Category,
    int Quantity,
    int UnitPrice,
    int Subtotal
);

public record TaxInfoDto(string Label, decimal Rate, int Amount);

public record ServiceChargeDto(string Label, decimal Rate, int Amount);
