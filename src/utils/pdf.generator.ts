import PDFDocument from 'pdfkit';
import { Writable } from 'stream';

export const PDFGenerator = {
  async generateBookReportBuffer(title: string, data: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Header
      doc.fontSize(22).fillColor('#2563eb').text('BookBridge Academic Platform', { align: 'center' });
      doc.fontSize(14).fillColor('#475569').text(title, { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(10).fillColor('#64748b').text(`Generated Date: ${new Date().toLocaleString()}`);
      doc.moveDown();

      // Content items
      data.forEach((item, index) => {
        doc.fontSize(12).fillColor('#0f172a').text(`${index + 1}. ${item.title || item.name || 'Record'}`);
        doc.fontSize(10).fillColor('#475569').text(`   Details: ${JSON.stringify(item)}`);
        doc.moveDown(0.5);
      });

      // Footer
      doc.fontSize(9).fillColor('#94a3b8').text('© 2026 BookBridge — Verified Student Academic Platform', 50, 700, { align: 'center' });

      doc.end();
    });
  }
};
