namespace SplitTheBill.Api.Dtos;

public record CreatePaymentIntentRequest(
    string Session,
    int Amount,
    int TipAmount,
    string SplitMode,
    List<string>? ItemIds = null
);

public record CreatePaymentIntentResponse(string PaymentId, string ClientSecret);

public record ConfirmPaymentRequest(string Session, string PaymentId, string StripePaymentIntentId);
