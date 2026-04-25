using System.Security.Claims;
using SplitTheBill.Api.Services;

namespace SplitTheBill.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost(
            "/login",
            async (LoginRequest request, AuthService authService) =>
            {
                var (token, user, error) = await authService.LoginAsync(
                    request.Email,
                    request.Password
                );

                if (token is null)
                    return Results.Unauthorized();

                return Results.Ok(
                    new
                    {
                        token,
                        user = new
                        {
                            id = user!.Id,
                            fullName = user.FullName,
                            email = user.Email,
                            restaurantId = user.RestaurantId,
                        },
                    }
                );
            }
        );

        group
            .MapGet(
                "/me",
                (ClaimsPrincipal principal) =>
                {
                    var userId = principal.FindFirstValue("sub");
                    var email = principal.FindFirstValue("email");
                    var restaurantId = principal.FindFirstValue("restaurantId");
                    var fullName = principal.FindFirstValue("fullName");

                    return Results.Ok(
                        new
                        {
                            id = userId,
                            email,
                            fullName,
                            restaurantId,
                        }
                    );
                }
            )
            .RequireAuthorization();
    }
}

public record LoginRequest(string Email, string Password);
