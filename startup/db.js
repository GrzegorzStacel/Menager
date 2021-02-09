const mongoose = require('mongoose');
require('dotenv').config();
const config = require("config");

module.exports = function () {
    const db = config.get('db');
    mongoose.connect(db, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true
    })

    const dbConnection = mongoose.connection;
    dbConnection.on('error', error => console.error(error))
    dbConnection.once('open', () => console.log('Connected to Mongoose'))
}