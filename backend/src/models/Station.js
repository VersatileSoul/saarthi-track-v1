const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    code: {
        type: String,
        required: [true, "Station code is required"],
        unique: true,
        trim: true,
        minlength: [3, "Station code must be at least 3 characters"],
        maxlength: [5, "Station code must be at most 5 characters"],
    },
    location: {
        latitude: {
            type: Number,
            required: [true, "Latitude is required"],
            min: [-90, "Latitude must be between -90 and 90"],
            max: [90, "Latitude must be between -90 and 90"],
        },
        longitude: {
            type: Number,
            required: [true, "Longitude is required"],
            min: [-180, "Longitude must be between -180 and 180"],
            max: [180, "Longitude must be between -180 and 180"],
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
        },
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true,
        },
        country: {
            type: String,
            required: [true, "Country is required"],
            trim: true,
        },
        postalCode: {
            type: String,
            required: [true, "Postal code is required"],
            trim: true,
        }
    },
    type: {
        type: String,
        enum: {
            values: ["terminal", "intermediate"],
            message: "Station type must be either terminal or intermediate",
        },
        default: "intermediate",
    },
    facilities: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Indexes
stationSchema.index({ name: 1 }, { unique: true });
stationSchema.index({ code: 1 }, { unique: true });
stationSchema.index({ isActive: 1 });

// Geospatial index for location (2dsphere)
stationSchema.index({'location.latitude': 1, 'location.longitude': 1});

// Alternative: use 2dsphere index for location if using GeoJSON format
// stationSchema.index({ location: '2dsphere' });

const Station = mongoose.model("Station", stationSchema);

module.exports = Station;