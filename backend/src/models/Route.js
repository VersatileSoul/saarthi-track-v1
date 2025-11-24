const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
    station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
        required: [true, "Station is required"],
    },
    order: {
        type: Number,
        required: [true, "Order is required"],
        min: [1, "Order must be at least 1"],
    },
    estimatedTime: {
        type: Number,
        default: 0,
        min: [0, "Estimated time must be at least 0"],
    },
    distance: {
        type: Number,
        default: 0,
        min: [0, "Distance must be at least 0"],
    },
}, { _id: false });

const routeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        unique: true,
        trim: true,

    },
    origin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
        required: [true, "Origin is required"],
    },
    destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
        required: [true, "Destination is required"],
    },
    stops: {
        type: [stopSchema],
        required: [true, "Stops are required"],
        validate: {
            validator: function(stops) {
                // must have at least 2 stops (origin and destination)
                return stops && stops.length >= 2;
            },
            message: "Route must have at least 2 stops (origin and destination)"
        },
    },
    totalDistance: {
        type: Number,
        min: [0, "Total distance cannot be negative"],
    },
    estimatedDuration: {
        type: Number,
        min: [0, "Estimated duration cannot be negative"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Indexes
routeSchema.index({name: 1}, {unique: true});
routeSchema.index({origin:1});
routeSchema.index({destination:1});
routeSchema.index({isActive:1});

// Validation: Origin and destination must be different
routeSchema.pre("validate", function(next) {
    if(this.origin && this.destination && this.origin.toString() === this.destination.toString()) {
        this.invalidate("destination", "Origin and destination cannot be the same");
    }
    next();
});

// Validation: First stop must match origin, Last stop must match destination
routeSchema.pre("validate", function(next) {
    if(this.stops && this.stops.length > 0) {
        const firstStop = this.stops[0];
        const lastStop = this.stops[this.stops.length-1];

        if(this.origin && firstStop.station.toString() !== this.origin.toString()) {
            this.invalidate("stops", "First stop must match origin station");
        }

        if(this.destination && lastStop.station.toString() !== this.destination.toString()) {
            this.invalidate("stops", "Last stop must match destination station");
        }
    }
    next();
});

// Validation: Stop order must be sequential (1,2,3,...)
routeSchema.pre('validate', function(next) {
    if(this.stops && this.stops.length > 0) {
        const orders = this.stops.map((stop) => stop.order).sort((a,b) => a - b); // Extract orders from stops and sort them ac
        for(let i = 0; i < orders.length - 1; i++) {
            if(orders[i] !== i+1) {
                this.invalidate("stops", `Stops orders must be sequential starting from 1. Found ${orders.join(', ')}`);
                break;
            }
        }
    }
    next();
});

// Validation: No duplicate stations in stops
routeSchema.pre('validate', function(next) {
    if(this.stops && this.stops.length > 0) {
        const stationIds = this.stops.map((stop) => stop.station.toString()); // extract station ids from stops 
        const uniqueStationIds = [...new Set(stationIds)]; // create a new array with unique station ids
        if(stationIds.length !== uniqueStationIds.length) {
            this.invalidate("stops", "Stops cannot have duplicate stations"); 
        }
    }
    next();
})

const Route = mongoose.model("Route", routeSchema);

module.exports = Route;