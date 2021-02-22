const mongoose = require('mongoose')
const Game = require('./Game')

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

companySchema.pre('remove', function(next) {
    Game.find({ company: this.id }, (err, games) => {
        if (err) {
            next(err)
        } else if (games.length > 0) {
            next(new Error('This company has game still')) ///TODO wyświetlić ten komunikat userowi
        } else {
            next();
        }
    })
})

module.exports = mongoose.model('Company', companySchema)