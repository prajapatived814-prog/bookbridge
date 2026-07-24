import QRCode from 'qrcode';

export const QRGenerator = {
  async generateBase64QR(textOrUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(textOrUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      });
    } catch (err: any) {
      throw new Error(`Failed to generate QR Code: ${err.message}`);
    }
  }
};
