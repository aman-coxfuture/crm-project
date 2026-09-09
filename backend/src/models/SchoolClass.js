const mongoose = require("mongoose");

const schoolClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },

    sections: [
      {
        type: String,
        trim: true,
      },
    ],

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant ID is required"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Same class name can exist in different schools,
// but not twice in the same school.
schoolClassSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const SchoolClass = mongoose.model("SchoolClass", schoolClassSchema);

module.exports = SchoolClass;
