const express = require('express');
const home = require('../routes/home');


module.exports = function(app) {
    app.use('/', home)
}