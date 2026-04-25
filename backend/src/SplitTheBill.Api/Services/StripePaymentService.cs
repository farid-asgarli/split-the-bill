using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SplitTheBill.Api.Data;
using SplitTheBill.Api.Dtos;
using SplitTheBill.Api.Entities;
using Stripe;

namespace SplitTheBill.Api.Services;

public class StripePaymentService(
    AppDbContext db,
    IConfiguration config,
    SseConnectionManager sse,
    BillService billService
)
{
    public async Task<CreatePaymentIntentResponse> CreatePaymentIntentAsync(
        string tableId,
        CreatePaymentIntentRequest request
    )
    {
        var session =
            await db
                .TableSessions.Include(s => s.Bill)
                .FirstOrDefaultAsync(s =>
                    s.Id == request.Session && s.TableId == tableId && s.IsActive
                ) ?? throw new InvalidOperationException("Session not found");

        var bill = session.Bill ?? throw new InvalidOperationException("Bill not found");

        var totalAmount = request.Amount + request.TipAmount;

        var options = new PaymentIntentCreateOptions
        {
            Amount = totalAmount,
            Currency = bill.Currency.ToLowerInvariant(),
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
            {
                Enabled = true,
            },
            Metadata = new Dictionary<string, string>
            {
                ["billId"] = bill.Id,
                ["tableId"] = tableId,
                ["sessionId"] = request.Session,
            },
        };

        var stripeClient = new StripeClient(config["Stripe:SecretKey"]);
        var service = new PaymentIntentService(stripeClient);
        var paymentIntent = await service.CreateAsync(options);

        var payment = new Entities.Payment
        {
            BillId = bill.Id,
            Amount = request.Amount,
            TipAmount = request.TipAmount,
            SplitMode = request.SplitMode,
            ItemIds = request.ItemIds is not null
                ? JsonSerializer.Serialize(request.ItemIds)
                : null,
            StripePaymentIntentId = paymentIntent.Id,
            Status = PaymentStatus.Pending,
        };

        db.Payments.Add(payment);
        await db.SaveChangesAsync();

        if (request.ItemIds is { Count: > 0 })
        {
            var billResponse = await billService.GetBillByTableIdAsync(tableId, request.Session);
            if (billResponse is not null)
                await sse.BroadcastAsync(tableId, "bill_updated", billResponse);
        }

        return new CreatePaymentIntentResponse(payment.Id.ToString(), paymentIntent.ClientSecret!);
    }

    public async Task<bool> ConfirmPaymentAsync(string tableId, ConfirmPaymentRequest request)
    {
        var payment = await db
            .Payments.Include(p => p.Bill)
            .FirstOrDefaultAsync(p =>
                p.Id == Guid.Parse(request.PaymentId) && p.Bill.TableSessionId == request.Session
            );

        if (payment is null)
            return false;

        var stripeClient = new StripeClient(config["Stripe:SecretKey"]);
        var service = new PaymentIntentService(stripeClient);
        var paymentIntent = await service.GetAsync(request.StripePaymentIntentId);

        if (paymentIntent.Status == "succeeded")
        {
            payment.Status = PaymentStatus.Succeeded;
            payment.StripePaymentIntentId = paymentIntent.Id;

            var bill = payment.Bill;
            var totalPaid = await db
                .Payments.Where(p => p.BillId == bill.Id && p.Status == PaymentStatus.Succeeded)
                .SumAsync(p => p.Amount);

            // Include this payment if not yet saved
            if (payment.Status == PaymentStatus.Succeeded)
                totalPaid += payment.Amount;

            // Recalculate total to check if fully paid
            var items = await db.BillItems.Where(i => i.BillId == bill.Id).ToListAsync();
            var subtotal = items.Sum(i => i.Quantity * i.UnitPrice);
            var taxAmount = (int)Math.Round(subtotal * bill.TaxRate);
            var serviceChargeAmount = (int)Math.Round(subtotal * bill.ServiceChargeRate);
            var total = subtotal + taxAmount + serviceChargeAmount;

            bill.Status = totalPaid >= total ? BillStatus.Paid : BillStatus.Partial;
            await db.SaveChangesAsync();

            var billResponse = await billService.GetBillByTableIdAsync(tableId, request.Session);
            if (billResponse is not null)
                await sse.BroadcastAsync(tableId, "bill_updated", billResponse);

            return true;
        }

        if (paymentIntent.Status == "canceled" || paymentIntent.Status == "requires_payment_method")
        {
            payment.Status = PaymentStatus.Failed;
            await db.SaveChangesAsync();
        }

        return false;
    }
}
