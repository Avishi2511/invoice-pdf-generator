const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  status: { type: String, default: 'processing' },
  pdfUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
