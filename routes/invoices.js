const express = require("express");
const {
  getInvoices,
  getInvoice,
  createInvoice,
  deleteInvoice,
} = require("../controllers/invoices");

const router = express.Router({ mergeParams: true });

router.route("/").get(getInvoices).post(createInvoice);
router.route("/:id").get(getInvoice).delete(deleteInvoice);

module.exports = router;
