const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model to identify the user 
        ref: "User", // Reference to the User model
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    isRevoked: {
        type: Boolean,
        default: false,
    },
    revokedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true }); 

// Indexes
//refreshTokenSchema.index({token:1},{unique:true}); 
refreshTokenSchema.index({user:1});
refreshTokenSchema.index({expiresAt:1}, {expireAfterSeconds: 0}); // automatically delete the token after the expiration date

// Method to check if the token is valid
refreshTokenSchema.methods.isValid = function(){
    return !this.isRevoked && this.expiresAt > new Date();  
    // !this.isRevoked: Check if the token is not revoked
    // this.expiresAt > new Date(): Check if the token is not expired
}

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllUserTokens = async function(userId) {
    return await this.updateMany({
        user: userId, isRevoked: false,}, // query to find the tokens that are not revoked and are for the user
        {isRevoked: true, revokedAt: new Date()}, // update the tokens to be revoked and set the revokedAt date
    );
    // updateMany: Update multiple documents that match the query
};

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = RefreshToken;