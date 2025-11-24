const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: [true, 'Assignment is required'],
    },
    station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: [true, 'Station is required'],
    },
    requestType: {
        type: String,
        enum: {
            values: ['DEPARTURE', 'ARRIVAL'],
            message: 'Request type must be either DEPARTURE or ARRIVAL',
        },
        default: 'DEPARTURE',
    },
    status: {
        type: String,
        enum: {
            values: ['PENDING', 'APPROVED', 'REJECTED'],
            message: 'Status must be either PENDING, APPROVED, or REJECTED',
        },
        default: 'PENDING',
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Requested by is required'],
    },
    requestedAt: {
        type: Date,
        default: Date.now,
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    approvedAt: {
        type: Date,
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    rejectedAt: {
        type: Date,
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Rejection reason cannot be more than 500 characters'],
    },
}, { timestamps: true });

// Indexes 
requestSchema.index({assignment: 1});
requestSchema.index({station: 1});
requestSchema.index({status: 1});
requestSchema.index({requestedBy: 1});
requestSchema.index({requestedAt: -1}); 
// Compound index for pending requests at station (for officer dashboard)
requestSchema.index({station: 1, status: 1, requestedAt: -1});
// Compound index for requests for an assignment (for driver/conductor dashboard)
requestSchema.index({assignment: 1, status: 1});

// Validation: Set approvedAt when status becomes APPROVED
requestSchema.pre('save', function(next) {
    if(this.isModified('status') && this.status === 'APPROVED' && !this.approvedAt) {
        this.approvedAt = new Date();
    }
    next();
});

// Validation: Set rejectedAt when status becomes REJECTED
requestSchema.pre('save', function(next) {
    if(this.isModified('status') && this.status === 'REJECTED' && !this.rejectedAt) {
        this.rejectedAt = new Date();
    }
    next();
});

// Validation: Status transitions (one-way: pending -> approved/rejected)
requestSchema.pre('save', function(next) {
    if(this.isModified('status')) {
        // If status is being changed from approved/rejected, prevent it
        if(this.status === 'PENDING' && this._originalStatus && this._originalStatus !== 'PENDING') {
            return next(new Error('Cannot change status from approved/rejected to pending'));
        }
    }
    next();
});

// Store original status before modification
requestSchema.pre('save', function(next) {
    if(this.isModified('status') && !this.isNew) {
        this._originalStatus = this.status;
    }
    next();
});

// Validation: Approved/rejected by must be officer
requestSchema.pre('save', async function(next) {
    if(this.isModified('approvedBy') && this.approvedBy) {
        try {
            const User = mongoose.model('User');
            const officer = await User.findById(this.approvedBy);
            if(!officer) {
                return next(new Error('Officer not found'));
            }
            if(officer.role !== 'officer' && officer.role !== 'admin') {
                return next(new Error('Only officers or admins can approve requests'));
            }
        }
        catch(err) {
            return next(err);
        }
    }
    if(this.isModified('rejectedBy') && this.rejectedBy) {
        try {
            const User = mongoose.model('User');
            const officer = await User.findById(this.rejectedBy);
            if(!officer) {
                return next(new Error('Officer not found'));
            }
            if(officer.role !== 'officer' && officer.role !== 'admin') {
                return next(new Error('Only officers or admins can reject requests'));
            }
        }
        catch(err) {
            return next(err);
        }
    }
    next();
}); 

// Validation: Assignment must be active
requestSchema.pre('save', async function(next) {
    if(this.isNew || this.isModified('assignment')) {
        try {
            const Assignment = mongoose.model('Assignment');
            const assignment = await Assignment.findById(this.assignment);
            if(!assignment) {
                return next(new Error('Assignment not found'));
            }
            if(assignment.status !== 'ACTIVE') {
                return next(new Error('Can only create requests for active assignments'));
            } 
        }
        catch(err) {
            return next(err);
        }
    }
    next();
});

// Validation: Station must be on the route
requestSchema.pre('save', async function(next) {
    if(this.isNew || this.isModified('station') || this.isModified('assignment')) {
        try {
            const Assignment = mongoose.model('Assignment');
            const Route = mongoose.model('Route');
            
            const assignment = await Assignment.findById(this.assignment);
            if(!assignment || !assignment.route) {
                return next(new Error('Assignment or route not found'));
            }

            const route = await Route.findById(assignment.route._id);
            if(!route) {
                return next(new Error('Route not found'));
            }

            // Check if station is in the route's stops
            const stationInRoute = route.stops.some((stop) => stop.station.toString() === this.station.toString());
            // how it works .some() method returns true if any element in the array satisfies the condition
            if(!stationInRoute) {
                return next(new Error('Station must be on the assignment\'s route'));
            }
        }
        catch(err) {
            return next(err);
        }
    }
    next();
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;