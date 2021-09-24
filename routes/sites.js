const express = require("express");
const {
  getSites,
  getSite,
  createSite,
  updateSite,
  deleteSite,
  getInvoicePreview,
} = require("../controllers/sites");

//Include other resource routers
const invoiceRouter = require("./invoices");

const router = express.Router();

// Re-route into other resource routers
router.use("/:siteId/invoices", invoiceRouter);

router.route("/").get(getSites).post(createSite);
router.route("/:id").get(getSite).put(updateSite).delete(deleteSite);
router.route("/:id/invoice-preview").get(getInvoicePreview);

module.exports = router;
