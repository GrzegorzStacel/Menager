const express = require('express');
const index = require('../routes/index');


module.exports = function(app) {
    app.use('/', index);
}