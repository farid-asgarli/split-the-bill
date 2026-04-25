FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/SplitTheBill.Api/SplitTheBill.Api.csproj src/SplitTheBill.Api/
RUN dotnet restore src/SplitTheBill.Api/SplitTheBill.Api.csproj

COPY . .
RUN dotnet publish src/SplitTheBill.Api/SplitTheBill.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "SplitTheBill.Api.dll"]
