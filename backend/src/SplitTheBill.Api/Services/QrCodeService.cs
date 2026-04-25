using QRCoder;

namespace SplitTheBill.Api.Services;

public class QrCodeService(IConfiguration config)
{
    public byte[] GenerateQrCode(string tableId, string sessionToken, int pixelsPerModule = 10)
    {
        var url = BuildUrl(tableId, sessionToken);
        using var generator = new QRCodeGenerator();
        using var data = generator.CreateQrCode(url, QRCodeGenerator.ECCLevel.M);
        using var qrCode = new PngByteQRCode(data);
        return qrCode.GetGraphic(pixelsPerModule);
    }

    public string GenerateQrCodeSvg(string tableId, string sessionToken)
    {
        var url = BuildUrl(tableId, sessionToken);
        using var generator = new QRCodeGenerator();
        using var data = generator.CreateQrCode(url, QRCodeGenerator.ECCLevel.M);
        var svgQrCode = new SvgQRCode(data);
        return svgQrCode.GetGraphic(10);
    }

    private string BuildUrl(string tableId, string sessionToken)
    {
        var baseUrl = config["App:BaseUrl"] ?? "http://localhost:3000";
        return $"{baseUrl}/table/{tableId}?session={sessionToken}";
    }
}
