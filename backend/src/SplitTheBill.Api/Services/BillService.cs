using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SplitTheBill.Api.Data;
using SplitTheBill.Api.Dtos;
using SplitTheBill.Api.Entities;

namespace SplitTheBill.Api.Services;

public class BillService(AppDbContext db)
{
    public async Task<BillResponseDto?> GetBillByTableIdAsync(string tableId, string? session)
    {
        var query = db
            .TableSessions.Include(s => s.Table)
            .ThenInclude(t => t.Restaurant)
            .Include(s => s.Bill)
            .ThenInclude(b => b!.Items)
            .Include(s => s.Bill)
            .ThenInclude(b => b!.Payments)
            .Where(s => s.TableId == tableId && s.IsActive);

        if (session is not null)
            query = query.Where(s => s.Id == session);

        var tableSession = await query.FirstOrDefaultAsync();
        if (tableSession?.Bill is null)
            return null;

        var bill = tableSession.Bill;
        var table = tableSession.Table;
        var restaurant = table.Restaurant;

        var subtotal = bill.Items.Sum(i => i.Quantity * i.UnitPrice);
        var taxAmount = (int)Math.Round(subtotal * bill.TaxRate);
        var serviceChargeAmount = (int)Math.Round(subtotal * bill.ServiceChargeRate);
        var total = subtotal + taxAmount + serviceChargeAmount;

        var succeededPayments = bill
            .Payments.Where(p => p.Status == PaymentStatus.Succeeded)
            .ToList();
        var pendingPayments = bill.Payments.Where(p => p.Status == PaymentStatus.Pending).ToList();

        var amountPaid = succeededPayments.Sum(p => p.Amount);
        var amountRemaining = total - amountPaid;

        var paidItemIds = succeededPayments
            .Where(p => p.ItemIds is not null)
            .SelectMany(p => JsonSerializer.Deserialize<List<string>>(p.ItemIds!)!)
            .Distinct()
            .ToList();

        var lockedItemIds = pendingPayments
            .Where(p => p.ItemIds is not null)
            .SelectMany(p => JsonSerializer.Deserialize<List<string>>(p.ItemIds!)!)
            .Distinct()
            .ToList();

        return new BillResponseDto(
            Restaurant: new RestaurantDto(
                restaurant.Id,
                restaurant.Name,
                restaurant.Logo,
                restaurant.Address,
                restaurant.GooglePlaceId
            ),
            Table: new TableDto(table.Id, table.Number, tableSession.Id),
            Bill: new BillDto(
                Id: bill.Id,
                Status: bill.Status.ToString().ToLowerInvariant(),
                CreatedAt: bill.CreatedAt.ToString("O"),
                Currency: bill.Currency,
                Items: bill.Items.Select(i => new BillItemDto(
                        i.Id,
                        i.Name,
                        i.Category,
                        i.Quantity,
                        i.UnitPrice,
                        i.Quantity * i.UnitPrice
                    ))
                    .ToList(),
                Subtotal: subtotal,
                Tax: new TaxInfoDto(bill.TaxLabel, bill.TaxRate, taxAmount),
                ServiceCharge: new ServiceChargeDto(
                    bill.ServiceChargeLabel,
                    bill.ServiceChargeRate,
                    serviceChargeAmount
                ),
                Total: total,
                AmountPaid: amountPaid,
                AmountRemaining: amountRemaining,
                PaidItemIds: paidItemIds.Count > 0 ? paidItemIds : null,
                LockedItemIds: lockedItemIds.Count > 0 ? lockedItemIds : null
            )
        );
    }
}
