const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const serviceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "error"],
      default: "inactive",
    },
    lastChecked: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Automatically update status to inactive if URL check fails
serviceSchema.methods.updateStatus = async function () {
  try {
    const response = await fetch(this.url);
    if (!response.ok) {
      this.status = "inactive";
      await this.save();
    }
  } catch (error) {
    this.status = "inactive";
    await this.save();
  }
  this.lastChecked = Date.now();
  await this.save();
};

// Schedule status update every 5 minutes
setInterval(async () => {
  const services = await ServiceModel.find();
  for (const service of services) {
    await service.updateStatus();
  }
}, 5 * 60 * 1000);

const ServiceModel = mongoose.model("Service", serviceSchema);
module.exports = ServiceModel;
