const Joi = require('joi');
const mongoose = require('mongoose')
const { Game } = require('./Game')

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    whoCreate: {
        type: String
    },
    createdAt: {
        type: String,
    }
})

companySchema.pre('remove', function(next) {
    Game.find({ company: this.id }, (err, games) => {
        if (err) {
            next(err)
        } else if (games.length > 0) {
            next(`You cannot remove '${this.name}' because it has games assigned to it`);
        } else {
            next();
        }
    })
})

function validateCompany(company) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).required()
    });

    return schema.validate(company)
}

exports.validate = validateCompany;
exports.Company = mongoose.model('Company', companySchema)