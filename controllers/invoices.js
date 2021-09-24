const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Site = require("../models/Site");
const Invoice = require("../models/Invoice");

// @desc    Get invoices
// @route   GET /api/v1/invoices
// @route   GET /api/v1/sites/:siteId/invoices
// @access  Private
exports.getInvoices = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.siteId) {
    query = Invoice.find({ site: req.params.siteId })
      .populate({
        path: "site",
      })
      .sort({ createAt: -1 });
  } else {
    query = Invoice.find().populate({
      path: "site",
    });
  }

  const invoices = await query;

  res.status(200).json({
    success: true,
    count: invoices.length,
    data: invoices,
  });
});

// @desc    Get invoices
// @route   GET /api/v1/invoices/:id
// @access  Private
exports.getInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id).populate({
    path: "site",
    select: "totalCost",
  });

  if (!invoice) {
    return next(
      new ErrorResponse(`No invoice with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: invoice,
  });
});

// @desc    Create invoices
// @route   POST /api/v1/sites/:siteId/invoices
// @access  Private
exports.createInvoice = asyncHandler(async (req, res, next) => {
  const site = await Site.findById(req.params.siteId);

  //Check if site exists for its invoice to be created
  if (!site) {
    return next(
      new ErrorResponse(`No site with the id of ${req.params.siteId}`),
      404
    );
  }
  req.body.site = req.params.siteId;
  const invoice = await Invoice.create(req.body);

  res.status(200).json({
    success: true,
    data: invoice,
  });
});

// @desc    Delete invoices
// @route   DELETE /api/v1/invoices/:id
// @access  Private
exports.deleteInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(
      new ErrorResponse(`No invoice with the id of ${req.params.id}`),
      404
    );
  }
  invoice.remove();

  res.status(200).json({
    success: true,
    data: {},
    msg: "Invoice deleted",
  });
});
