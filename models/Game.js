const Joi = require('joi');
Joi.ObjectId = require('joi-objectid')(Joi)
const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
    title: {
        type: String,
        minlength: 2,
        maxlength: 255,
        required: true
    },
    whoCreate: {
        type: String
    },
    description: {
        type: String,
        maxlength: 2000
    },
    publishDate: {
        type: Date,
        required: true
    },
    playTime: {
        type: Number,
        required: true
    },
    createdAt: {
        type: String
    },
    coverImage: {
        type: Buffer,
        required: true
    },
    coverImageType: {
        type: String,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Company'
    }
})

gameSchema.virtual('coverImagePath').get(function () {
    if (this.coverImage != null && this.coverImageType != null) {
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})

const Game = mongoose.model('Game', gameSchema);

function validateGame(game) {
    const schema = Joi.object({
        title: Joi.string().min(2).max(255).required(),
        description: Joi.string().min(0).max(2000),
        publishDate: Joi.date().required(),
        playTime: Joi.number().required(),
        coverImage: Joi.binary(),
        coverImageType: Joi.string(),
        company: Joi.ObjectId().required(),
        cover: Joi.string()
    });

    return schema.validate(game)
}

exports.validate = validateGame;
exports.Game = Game;