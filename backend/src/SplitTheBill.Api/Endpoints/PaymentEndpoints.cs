using SplitTheBill.Api.Dtos;
using SplitTheBill.Api.Services;

namespace SplitTheBill.Api.Endpoints;

public static class PaymentEndpoints
{
    public static void MapPaymentEndpoints(this WebApplication app)
    {
        app.MapPost(
            "/api/bill/{tableId}/payment/create-intent",
            async (
                string tableId,
                CreatePaymentIntentRequest request,
                StripePaymentService stripeService
            ) =>
            {
                try
                {
                    var result = await stripeService.CreatePaymentIntentAsync(tableId, request);
                    return Results.Ok(result);
                }
                catch (InvalidOperationException ex)
                {
                    return Results.NotFound(new { error = ex.Message });
                }
            }
        );

        app.MapPost(
            "/api/bill/{tableId}/payment/confirm",
            async (
                string tableId,
                ConfirmPaymentRequest request,
                StripePaymentService stripeService
            ) =>
            {
                var success = await stripeService.ConfirmPaymentAsync(tableId, request);
                return success
                    ? Results.Ok(new { status = "succeeded" })
                    : Results.BadRequest(new { error = "Payment verification failed" });
            }
        );
    }
}
