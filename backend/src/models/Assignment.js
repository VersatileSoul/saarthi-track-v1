const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: [true, 'Bus is required'],
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Driver is required'],
    },
    conductor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Conductor is required'],
    },
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: [true, 'Route is required'],
    },
    status: {
        type: String,
        enum: {
            values: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
            message: 'Status must be either ACTIVE, COMPLETED, or CANCELLED',
        },
        default: 'ACTIVE',
    },
   currentStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
   },
   inTransit: {
    type: Boolean,
    default: false,
   },
   fromStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
   },
   startTime: {
    type: Date,
    required: [true, 'Start time is required'],
   },
   endTime: {
    type: Date,
   },
   startedAt: {
    type: Date,
   },
   completedAt: {
    type: Date,
   },
}, { timestamps: true });

// Indexes
assignmentSchema.index({bus: 1});
assignmentSchema.index({driver: 1});
assignmentSchema.index({conductor: 1});
assignmentSchema.index({route: 1});
assignmentSchema.index({status: 1});
assignmentSchema.index({currentStation: 1});
assignmentSchema.index({inTransit: 1});

// Compound Index for active assignments, newest first
assignmentSchema.index({status: 1, createdAt: -1});
// Compound index for driver's current assignment
assignmentSchema.index({driver: 1, status: 1});
// Compound index for conductor's current assignment
assignmentSchema.index({conductor: 1, status: 1});
// Compound index for bus's current assignment
assignmentSchema.index({bus: 1, status: 1});

// Validation: Set startedAt when status becomes ACTIVE
assignmentSchema.pre('save', function(next) {
    if(this.isNew && this.status === 'ACTIVE' && !this.startedAt) {
        this.startedAt = new Date();
    }
    if(this.isModified('status') && this.status === 'ACTIVE' && !this.startedAt) {
        this.startedAt = new Date();
    }
    next();
});

// Validation: Set completedAt when status becomes COMPLETED
assignmentSchema.pre('save', function(next) {
    if(this.isModified('status') && this.status === 'COMPLETED' && !this.completedAt) {
        this.completedAt = new Date();
    }
    if(!this.endTime) {
        this.endTime = new Date();
    }
    next();
});

// Validation: Driver must have role 'driver'
assignmentSchema.pre('save', async function(next) {
    if(this.isNew || this.isModified('driver')) {
        try {
            const User = mongoose.model('User');
            const driver = await User.findById(this.driver);
            if(!driver) {
                return next(new Error('Driver not found'));
            }
            if(driver.role !== 'driver') {
                return next(new Error('Assigned driver must be a driver'));
            }
        }
        catch(err) {
            return next(err);
        }
    }
    next();
});

// Validation: Conductor must have role 'conductor'
assignmentSchema.pre('save', async function(next) {
    if(this.isNew || this.isModified('conductor')) {
        try {
            const User = mongoose.model('User');
            const conductor = await User.findById(this.conductor);
            if(!conductor) {
                return next(new Error('Conductor not found'));
            }
            if(conductor.role !== 'conductor') {
                return next(new Error('Assigned conductor must be a conductor'));
            }
        }
        catch(err) {
            return next(err);
        }
    }
    next();
});

// Validation: Only one active assignment per bus
assignmentSchema.pre('save', async function(next) {
    if((this.isNew || this.isModified('status')) && this.status === 'ACTIVE') {
        try {
            const query = {
                bus: this.bus,
                status: 'ACTIVE',
            };
            // Exclude current document if updating
            if(!this.isNew) {
                query._id = {$ne : this._id};
            }
            const existingAssignment = await mongoose.model('Assignment').findOne(query);
            if(existingAssignment) {
                return next(new Error('Bus already has an active assignment'));
            }
        }
        catch(err) {
            return next(err);
        }
    }
    next();
});

// Validation: Only one active assignment per driver
assignmentSchema.pre('save', async function(next) {
    if((this.isNew || this.isModified('status')) && this.status === 'ACTIVE') {
        try {
            const query = {
                driver: this.driver,
                status: 'ACTIVE',
            };
            // Exclude current document if updating
            if(!this.isNew) {
                query._id = {$ne : this._id};
            }
            const existingAssignment = await mongoose.model('Assignment').findOne(query);
            if(existingAssignment) {
                return next(new Error('Driver already has an active assignment'));
            }
        }
        catch(err) {
            return next(err);
        }
    }
    next();
});

// Validation: Only one active assignment per conductor
assignmentSchema.pre('save', async function(next) {
    if((this.isNew || this.isModified('status')) && this.status === 'ACTIVE') {
        try {
            const query = {
                conductor: this.conductor,
                status: 'ACTIVE',
            };
            // Exclude current document if updating
            if(!this.isNew) {
                query._id = {$ne : this._id};
            }
            const existingAssignment = await mongoose.model('Assignment').findOne(query);
            if(existingAssignment) {
                return next(new Error('Conductor already has an active assignment'));
            }
        }
        catch(err) {
            return next(err);
        }
    }
    next();
});


const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;