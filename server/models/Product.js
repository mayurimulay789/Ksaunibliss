const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    images: [
      {
        url: String,
        alt: String,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    sizes: [
      {
        size: String,
        stock: { type: Number, default: 0 },
      },
    ],
    colors: [
      {
        name: String,
        code: String,
        images: [String],
      },
    ],
    tags: [
      {
        type: String,
        enum: ["trending", "new-arrival", "sale", "featured"],
      },
    ],
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        images: [String],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    sku: { type: String, unique: true },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ "rating.average": -1 });
productSchema.index({ price: 1 });

// Generate SKU and slug before saving
productSchema.pre("save", async function (next) {
  if (!this.sku) {
    let newSku;
    let exists = true;

    while (exists) {
      newSku = "FH" + Date.now() + Math.floor(Math.random() * 1000);
      exists = await mongoose.models.Product.findOne({ sku: newSku });
    }

    this.sku = newSku;
  }

  if (!this.slug) {
    let newSlug = slugify(this.name, { lower: true, strict: true });
    let slugExists = await mongoose.models.Product.findOne({ slug: newSlug });

    let suffix = 1;
    while (slugExists) {
      newSlug = `${slugify(this.name, { lower: true, strict: true })}-${suffix}`;
      slugExists = await mongoose.models.Product.findOne({ slug: newSlug });
      suffix++;
    }

    this.slug = newSlug;
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);
