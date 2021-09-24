const mongoose = require("mongoose");
const createPdf = require("../utils/pdfGenerator");
const fs = require("fs");

const InvoiceSchema = new mongoose.Schema({
  site: {
    type: mongoose.Schema.ObjectId,
    ref: "Site",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  file: {
    type: String,
    default: "HELLO",
  },
});

//TODO: if the site is on cash, invoices can still be created from backend but not from front end.

// Static method to get total paid amount
InvoiceSchema.statics.updatePaymentInfo = async function (siteId) {
  console.log(`Calculating payment info...`.blue);
  const obj = await this.aggregate([
    {
      $match: { site: siteId },
    },
    {
      $group: {
        _id: "$site",
        paidAmount: { $sum: "$amount" },
      },
    },
  ]);
  try {
    await this.model("Site").findByIdAndUpdate(siteId, {
      paidAmount: Math.ceil(obj[0].paidAmount / 10) * 10,
    });
  } catch (err) {
    console.log(err);
  }
};

InvoiceSchema.statics.createPdfFile = async function (siteId) {
  const site = await this.model("Site").findById(siteId);

  const fileId = await createPdf(site);
  console.log(`FILE CREATED: ${fileId}`);
  return fileId;
};

InvoiceSchema.post("save", async function () {
  await this.constructor.updatePaymentInfo(this.site);
  this.file = await this.constructor.createPdfFile(this.site);

  try {
    await this.model("Invoice").findByIdAndUpdate(this._id, {
      file: this.file,
    });
  } catch (err) {
    console.log(err);
  }
});

InvoiceSchema.pre("remove", function () {
  this.constructor.updatePaymentInfo(this.site);
  console.log(`../${this.file}`);
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
