﻿const mongoose = require('mongoose');
module.exports = mongoose.Collection('Messages', {
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    command: {
        type: String
    },
    parameters: {
        type: Objcet
    },
    timestamp: { type: Date, default: Date.now }
});