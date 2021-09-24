const mongoose = require("mongoose");

const SiteSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      unique: false,
    },
    email: String,
    contact: {
      type: Number,
      maxLength: [10, "Contact cannot be longer than 10 characters"],
    },
    company: {
      type: String,
      enum: ["Ks Builders", "Ks Paintings"],
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    onCash: {
      type: Boolean,
      default: false,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//TODO: calculate tax before creating the site and if its on cash.
SiteSchema.pre("save", async function (next) {
  let taxPer = 0;
  if (!this.onCash) {
    taxPer = process.env.COMPANY_TAX;
  }
  const tax = this.totalCost * (taxPer / 100);

  //Assigning to schema
  this.tax = Math.round(tax);
  next();
});

// Cascade delete invoices when site is deleted
SiteSchema.pre("remove", async function (next) {
  console.log(`Invoices being removed from site ${this._id}`);
  await this.model("Invoice").deleteMany({ site: this._id });
  //TODO: Delete all pdf files when site is deleted
  next();
});

//Reverse populate with virtuals
SiteSchema.virtual("invoices", {
  ref: "Invoice",
  localField: "_id",
  foreignField: "site",
  justOne: false,
});

module.exports = mongoose.model("Site", SiteSchema);
