const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateInvoicePDF(invoice, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Colors
    const primaryColor = '#2563eb'; // Blue
    const secondaryColor = '#64748b'; // Gray
    const accentColor = '#f8fafc'; // Light gray background

    // Helper function to add a colored rectangle
    const addColoredRect = (x, y, width, height, color) => {
      doc.save()
         .fillColor(color)
         .rect(x, y, width, height)
         .fill()
         .restore();
    };

    // Header Section
    addColoredRect(50, 50, 495, 80, accentColor);
    
    // Company Logo/Title Area
    doc.fontSize(24)
       .fillColor(primaryColor)
       .font('Helvetica-Bold')
       .text('InvoicePro', 70, 75);
    
    // Invoice Title
    doc.fontSize(28)
       .fillColor('#1a202c')
       .text('INVOICE', 350, 75, { align: 'right', width: 145 });

    // Reset to black for body text
    doc.fillColor('#000000');

    // Invoice Details Box (Top Right)
    const invoiceDetailsY = 160;
    addColoredRect(350, invoiceDetailsY, 195, 120, '#f1f5f9');
    
    doc.fontSize(10)
       .fillColor(secondaryColor)
       .font('Helvetica-Bold')
       .text('Invoice Number:', 365, invoiceDetailsY + 15);
    
    doc.fontSize(11)
       .fillColor('#000000')
       .font('Helvetica')
       .text(invoice._id.substring(0, 8).toUpperCase(), 365, invoiceDetailsY + 30);

    doc.fontSize(10)
       .fillColor(secondaryColor)
       .font('Helvetica-Bold')
       .text('Date Issued:', 365, invoiceDetailsY + 50);
    
    doc.fontSize(11)
       .fillColor('#000000')
       .font('Helvetica')
       .text(new Date(invoice.createdAt).toLocaleDateString(), 365, invoiceDetailsY + 65);

    doc.fontSize(10)
       .fillColor(secondaryColor)
       .font('Helvetica-Bold')
       .text('Due Date:', 365, invoiceDetailsY + 85);
    
    doc.fontSize(11)
       .fillColor('#000000')
       .font('Helvetica')
       .text(new Date(new Date(invoice.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), 365, invoiceDetailsY + 100);

    // Bill To Section
    doc.fontSize(12)
       .fillColor(primaryColor)
       .font('Helvetica-Bold')
       .text('BILL TO:', 70, invoiceDetailsY + 15);

    doc.fontSize(11)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(invoice.clientName, 70, invoiceDetailsY + 35);

    if (invoice.clientEmail) {
      doc.fontSize(10)
         .fillColor(secondaryColor)
         .font('Helvetica')
         .text(invoice.clientEmail, 70, invoiceDetailsY + 55);
    }

    // Items Table
    const tableTop = 320;
    const tableHeaders = ['DESCRIPTION', 'QTY', 'RATE', 'AMOUNT'];
    const tableWidths = [250, 80, 80, 85];
    let tableX = 70;

    // Table Header
    addColoredRect(50, tableTop, 495, 30, primaryColor);
    
    doc.fontSize(10)
       .fillColor('#ffffff')
       .font('Helvetica-Bold');

    for (let i = 0; i < tableHeaders.length; i++) {
      const headerX = i === tableHeaders.length - 1 ? tableX : tableX + 10;
      const align = i === tableHeaders.length - 1 ? 'right' : 'left';
      const width = i === tableHeaders.length - 1 ? tableWidths[i] - 20 : tableWidths[i];
      
      doc.text(tableHeaders[i], headerX, tableTop + 10, { 
        width: width, 
        align: align 
      });
      tableX += tableWidths[i];
    }

    // Table Rows
    let currentY = tableTop + 30;
    doc.fillColor('#000000').font('Helvetica');

    invoice.items.forEach((item, index) => {
      const rowHeight = 35;
      const isEvenRow = index % 2 === 0;
      
      if (isEvenRow) {
        addColoredRect(50, currentY, 495, rowHeight, '#f8fafc');
      }

      tableX = 70;
      
      // Description
      doc.fontSize(10)
         .text(item.description, tableX + 10, currentY + 12, { 
           width: tableWidths[0] - 20,
           ellipsis: true
         });
      tableX += tableWidths[0];

      // Quantity
      doc.text(item.quantity.toString(), tableX + 10, currentY + 12, { 
        width: tableWidths[1] - 20,
        align: 'center'
      });
      tableX += tableWidths[1];

      // Rate
      doc.text(`$${item.unitPrice.toFixed(2)}`, tableX + 10, currentY + 12, { 
        width: tableWidths[2] - 20,
        align: 'right'
      });
      tableX += tableWidths[2];

      // Amount
      doc.text(`$${item.total.toFixed(2)}`, tableX + 10, currentY + 12, { 
        width: tableWidths[3] - 20,
        align: 'right'
      });

      currentY += rowHeight;
    });

    // Add bottom border to table
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, currentY)
       .lineTo(545, currentY)
       .stroke();

    // Totals Section
    const totalsY = currentY + 20;
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Totals Box
    addColoredRect(350, totalsY, 195, 100, '#f1f5f9');

    doc.fontSize(10)
       .fillColor(secondaryColor)
       .font('Helvetica')
       .text('Subtotal:', 365, totalsY + 15);
    
    doc.fillColor('#000000')
       .text(`$${subtotal.toFixed(2)}`, 365, totalsY + 15, { 
         width: 165,
         align: 'right'
       });

    doc.fillColor(secondaryColor)
       .text('Tax (10%):', 365, totalsY + 35);
    
    doc.fillColor('#000000')
       .text(`$${tax.toFixed(2)}`, 365, totalsY + 35, { 
         width: 165,
         align: 'right'
       });

    // Total line with emphasis
    doc.strokeColor(primaryColor)
       .lineWidth(1)
       .moveTo(365, totalsY + 55)
       .lineTo(530, totalsY + 55)
       .stroke();

    doc.fontSize(12)
       .fillColor(primaryColor)
       .font('Helvetica-Bold')
       .text('TOTAL:', 365, totalsY + 65);
    
    doc.text(`$${total.toFixed(2)}`, 365, totalsY + 65, { 
      width: 165,
      align: 'right'
    });

    // Footer Section
    const footerY = doc.page.height - 100;
    
    doc.fontSize(10)
       .fillColor(secondaryColor)
       .font('Helvetica')
       .text('Thank you for your business!', 70, footerY, { 
         width: 400,
         align: 'center'
       });

    doc.fontSize(9)
       .text('Payment is due within 30 days. Please include invoice number with payment.', 70, footerY + 20, { 
         width: 400,
         align: 'center'
       });

    // Add a subtle border around the entire document
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .rect(40, 40, 515, doc.page.height - 80)
       .stroke();

    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

module.exports = generateInvoicePDF;
