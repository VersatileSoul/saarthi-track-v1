const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
    number: {
        type: String,
        required: [true, "Bus number is required"],
        unique: true,
        trim: true,
        uppercase: true,
    },
    capacity: {
        type: Number,
        required: [true, "Bus capacity is required"],
        min: [1, "Bus capacity must be at least 1"],
        max: [100, "Bus capacity must be at most 100"],
    },
    type: {
        type: String,
        enum: {
            values: ['AC', 'NON-AC', 'SLEEPER', 'SEMI-SLEEPER', 'DOUBLE_DECKER', ],
            message: 'Bus type must be either AC, NON-AC, SLEEPER, or SEMI-SLEEPER',
        },
        default: 'NON-AC',
    },
    status: {
        type: String,
        enum: {
            values: ['AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE'],
            message: 'Bus status must be either AVAILABLE, MAINTENANCE, or OUT_OF_SERVICE',
        },
        default: 'AVAILABLE',
    },
    manufacturer: {
        type: String,
        trim: true,
    },
    model: {
        type: String,
        trim: true,
    },
    year: {
        type: Number,
        min: [1900, "Year must be at least 1900"],
        max: [new Date().getFullYear(), "Year must be at most " + new Date().getFullYear()],
    },
    fuelType: {
        type: String,
        enum: {
            values: ['DIESEL', 'PETROL', 'ELECTRIC', 'HYBRID', 'CNG'],
            message: 'Fuel type must be either DIESEL, PETROL, ELECTRIC, HYBRID, or CNG', 
        },
        default: 'DIESEL',
    },
    registrationNumber: {
        type: String,
        required: [true, "Registration number is required"],
        unique: true,
        trim: true,
        uppercase: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastMaintenanceDate: {
        type: Date,
        default: Date.now,
    },
    nextMaintenanceDate: {
        type: Date,
        default: Date.now,
    },
    maintenanceHistory: [{
        date: {
            type: Date,
            default: Date.now,
        },
        description: {
            type: String,
            trim: true,
        },
    }],
    
}, { timestamps: true });

// Indexes
busSchema.index({ number: 1 }, { unique: true });
busSchema.index({ registrationNumber: 1 }, { unique: true, sparse: true });
busSchema.index({ status: 1 });
busSchema.index({ fuelType: 1 });
busSchema.index({ isActive: 1 });
busSchema.index({ lastMaintenanceDate: 1 });
busSchema.index({ nextMaintenanceDate: 1 });
busSchema.index({type: 1});

const Bus = mongoose.model("Bus", busSchema);

module.exports = Bus;