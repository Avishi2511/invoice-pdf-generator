const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  clientName: { type: String, required: true },
  items: [{ description: String, price: Number }],
  status: { type: String, default: 'processing' },
  pdfUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
