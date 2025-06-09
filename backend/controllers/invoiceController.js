const Invoice = require('../models/Invoice');

exports.createInvoice = async (req, res) => {
  try {
    const { userId, clientName, items } = req.body;

    const invoice = new Invoice({ userId, clientName, items });
    await invoice.save();

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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
