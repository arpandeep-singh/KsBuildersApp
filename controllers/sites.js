const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Site = require("../models/Site");
const createPdf = require("../utils/pdfGenerator");

// @desc    Get all sites
// @route   GET /api/v1/sites
// @access  Private
exports.getSites = asyncHandler(async (req, res, next) => {
  const sites = await Site.find().populate("invoices").sort({ createAt: -1 });
  res.status(200).json({ success: true, count: sites.length, data: sites });
});

// @desc    Get single sites
// @route   GET /api/v1/sites/:id
// @access  Private
exports.getSite = asyncHandler(async (req, res, next) => {
  const site = await Site.findById(req.params.id).populate({
    path: "invoices",
    options: { sort: { createAt: -1 } },
  });
  if (!site) {
    return next(
      new ErrorResponse(`Site not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ succes: true, data: site });
});

// @desc    Create new site
// @route   POST /api/v1/sites
// @access  Private
exports.createSite = asyncHandler(async (req, res, next) => {
  try {
    console.log("DATA RECIEVD: " + req.body);
    const site = await Site.create(req.body);
    res.status(201).json({ success: true, data: site });
  } catch (err) {
    next(err);
  }
});

// @desc    Create new site
// @route   PUT /api/v1/sites
// @access  Private
exports.updateSite = asyncHandler(async (req, res, next) => {
  const site = await Site.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!site) {
    return next(
      new ErrorResponse(`Site not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: site });
});

// @desc    Delete site
// @route   DELETE /api/v1/sites/:id
// @access  Private
exports.deleteSite = asyncHandler(async (req, res, next) => {
  const site = await Site.findById(req.params.id);
  if (!site) {
    return next(
      new ErrorResponse(`Site not found with id of ${req.params.id}`, 404)
    );
  }
  site.remove();
  res
    .status(200)
    .json({ success: true, data: {}, msg: "Deleted successfully" });
});

// @desc    Get invoice preview
// @route   GET /api/v1/sites/:id/invoice-preview
// @access  Private
exports.getInvoicePreview = asyncHandler(async (req, res, next) => {
  const site = await Site.findById(req.params.id);
  if (!site) {
    return next(
      new ErrorResponse(`Site not found with id of ${req.params.id}`, 404)
    );
  }

  const fileId = await createPdf(site);

  res.status(200).json({
    success: true,
    filePath: `pdf-invoices/${fileId}.pdf`,
  });
});
