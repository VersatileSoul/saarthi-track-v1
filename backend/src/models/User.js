const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      validate: {
        validator: function (v) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(v);
        },
        message:
          "Password must include uppercase, lowercase, number & special character",
      },
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^[6-9]\d{9}$/,
        "Phone must be a valid 10-digit Indian mobile number starting with 6-9",
      ],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["admin", "officer", "driver", "conductor"],
        message: "Role must be admin, officer, driver, or conductor",
      },
    },

    // Officer-specific fields
    stationIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
      },
    ],

    // Driver/Conductor-specific fields
    licenseNumber: {
      type: String,
      sparse: true,
    },

    employeeID: {
      type: String,
      unique: true,
      sparse: true,
    },

    //Common Fields
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1, unique: true });
userSchema.index({ employeeID: 1, unique: true, sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre("save", async function () {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified("password")) return;
  // Hash password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate employeeID (if not provided)
userSchema.pre("save", async function () {
  if (this.isNew && !this.employeeID) {
    // Generate employeeID for all roles : EMP-YYYYMMDD-XXXX
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    this.employeeID = `EMP-${dateStr}-${random}`;
  }
});

// Validation: Officers and admins should have stationIDs (optional for admin, required for station officers)
userSchema.pre("save", function () {
  if (
    this.role === "admin" &&
    (!this.stationIds || this.stationIds.length === 0)
  ) {
    // Allow empty for admin, can be assigned later
  }
  if (
    this.role === "officer" &&
    (!this.stationIds || this.stationIds.length === 0)
  ) {
    throw new Error("Station Officer must have at least one stationID");
  }
  if (
    this.stationIds &&
    (this.role === "driver" || this.role === "conductor")
  ) {
    this.stationIds = [];
  }
});

// Validation: Drivers should have licenseNumber
userSchema.pre("save", function () {
  if (this.role === "driver" && !this.licenseNumber) {
    throw new Error("Driver must have a licenseNumber");
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
