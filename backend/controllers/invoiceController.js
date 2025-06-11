const Invoice = require('../models/Invoice');
const generateInvoicePDF = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

exports.createInvoice = async (req, res) => {
  try {
    console.log('Received invoice creation request:', req.body);
    const { userId, clientName, clientEmail, items } = req.body;

    // Validate required fields
    if (!userId) {
      console.error('Missing userId in invoice creation request:', req.body);
      return res.status(400).json({ error: 'Missing userId. Please ensure you are logged in.' });
    }
    if (!clientName || !items || !Array.isArray(items) || items.length === 0) {
      console.error('Missing required invoice fields:', req.body);
      return res.status(400).json({ error: 'Missing required invoice fields' });
    }

    // Create invoice in DB with status 'processing'
    let invoice;
    try {
      invoice = new Invoice({ userId, clientName, clientEmail, items, status: 'processing' });
      await invoice.save();
      console.log('Invoice saved to DB:', invoice);
    } catch (dbErr) {
      console.error('Error saving invoice to DB:', dbErr);
      return res.status(500).json({ error: 'Failed to save invoice to DB', details: dbErr.message });
    }

    // Respond immediately so UI doesn't freeze
    res.status(201).json(invoice);

    // Generate PDF in background
    try {
      const pdfDir = path.join(__dirname, '..', 'pdfs');
      if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
      const pdfPath = path.join(pdfDir, `invoice_${invoice._id}.pdf`);
      generateInvoicePDF(invoice, pdfPath)
        .then(async () => {
          invoice.pdfUrl = `/pdfs/invoice_${invoice._id}.pdf`;
          invoice.status = 'ready';
          await invoice.save();
          console.log('PDF generated and invoice updated:', invoice);
        })
        .catch(async (err) => {
          invoice.status = 'error';
          await invoice.save();
          console.error('PDF generation failed:', err);
        });
    } catch (pdfGenErr) {
      console.error('Error during PDF generation setup:', pdfGenErr);
    }
  } catch (err) {
    console.error('Unexpected error in createInvoice:', err, err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getInvoicesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const invoices = await Invoice.find({ userId });
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { userId } = req.body; // Get userId from request body for security

    // Find the invoice and verify ownership
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Verify that the invoice belongs to the requesting user
    if (invoice.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized: You can only delete your own invoices' });
    }

    // Delete the PDF file if it exists
    if (invoice.pdfUrl) {
      const pdfPath = path.join(__dirname, '..', 'pdfs', `invoice_${invoice._id}.pdf`);
      if (fs.existsSync(pdfPath)) {
        try {
          fs.unlinkSync(pdfPath);
          console.log('PDF file deleted:', pdfPath);
        } catch (fsErr) {
          console.error('Error deleting PDF file:', fsErr);
          // Continue with database deletion even if file deletion fails
        }
      }
    }

    // Delete the invoice from database
    await Invoice.findByIdAndDelete(invoiceId);
    console.log('Invoice deleted successfully:', invoiceId);

    res.status(200).json({ message: 'Invoice deleted successfully', invoiceId });
  } catch (err) {
    console.error('Error deleting invoice:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
