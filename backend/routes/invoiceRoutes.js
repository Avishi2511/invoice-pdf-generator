const express = require('express');
const router = express.Router();
const { createInvoice, getInvoicesByUser } = require('../controllers/invoiceController');

router.post('/', createInvoice);
router.get('/:userId', getInvoicesByUser);

module.exports = router;
