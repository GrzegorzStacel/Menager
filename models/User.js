const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    gamesOwned: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        }
    ],
    gamesCompanies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Companies'
        }
    ]
})

const User = mongoose.model('User', UserSchema)

exports.User = User