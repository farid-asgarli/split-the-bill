using Microsoft.EntityFrameworkCore;
using SplitTheBill.Api.Data;
using SplitTheBill.Api.Entities;
using SplitTheBill.Api.Services;
using Stripe;

namespace SplitTheBill.Api.Endpoints;

public static class WebhookEndpoints
{
    public static void MapWebhookEndpoints(this WebApplication app)
    {
        app.MapPost(
            "/api/webhook/stripe",
            async (
                HttpContext context,
                AppDbContext db,
                IConfiguration config,
                SseConnectionManager sse,
                BillService billService
            ) =>
            {
                var json = await new StreamReader(context.Request.Body).ReadToEndAsync();
                var webhookSecret = config["Stripe:WebhookSecret"];

                Event? stripeEvent;
                try
                {
                    stripeEvent = EventUtility.ConstructEvent(
                        json,
                        context.Request.Headers["Stripe-Signature"],
                        webhookSecret
                    );
                }
                catch
                {
                    return Results.BadRequest(new { error = "Invalid signature" });
                }

                if (
                    stripeEvent.Type
                    is EventTypes.PaymentIntentSucceeded
                        or EventTypes.PaymentIntentPaymentFailed
                )
                {
                    var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                    if (paymentIntent is null)
                        return Results.Ok();

                    var payment = await db
                        .Payments.Include(p => p.Bill)
                        .ThenInclude(b => b.Session)
                        .ThenInclude(s => s.Table)
                        .FirstOrDefaultAsync(p => p.StripePaymentIntentId == paymentIntent.Id);

                    if (payment is null)
                        return Results.Ok();

                    if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded)
                    {
                        payment.Status = PaymentStatus.Succeeded;

                        var bill = payment.Bill;
                        var totalPaid = await db
                            .Payments.Where(p =>
                                p.BillId == bill.Id && p.Status == PaymentStatus.Succeeded
                            )
                            .SumAsync(p => p.Amount);

                        var items = await db
                            .BillItems.Where(i => i.BillId == bill.Id)
                            .ToListAsync();
                        var subtotal = items.Sum(i => i.Quantity * i.UnitPrice);
                        var taxAmount = (int)Math.Round(subtotal * bill.TaxRate);
                        var serviceChargeAmount = (int)
                            Math.Round(subtotal * bill.ServiceChargeRate);
                        var total = subtotal + taxAmount + serviceChargeAmount;

                        bill.Status = totalPaid >= total ? BillStatus.Paid : BillStatus.Partial;
                    }
                    else
                    {
                        payment.Status = PaymentStatus.Failed;
                    }

                    await db.SaveChangesAsync();

                    var tableId = payment.Bill.Session.TableId;
                    var session = payment.Bill.TableSessionId;
                    var billResponse = await billService.GetBillByTableIdAsync(tableId, session);
                    if (billResponse is not null)
                        await sse.BroadcastAsync(tableId, "bill_updated", billResponse);
                }

                return Results.Ok();
            }
        );
    }
}
