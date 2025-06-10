const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateInvoicePDF(invoice, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Client: ${invoice.clientName}`);
    if (invoice.clientEmail) doc.text(`Client Email: ${invoice.clientEmail}`);
    doc.moveDown();

    doc.text('Line Items:');
    invoice.items.forEach(item => {
      doc.text(`${item.description} - Qty: ${item.quantity} - Price: $${item.unitPrice} - Total: $${item.total}`);
    });

    doc.moveDown();
    const total = invoice.items.reduce((sum, i) => sum + (i.total || 0), 0);
    doc.text(`Total: $${total}`);

    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

module.exports = generateInvoicePDF;
