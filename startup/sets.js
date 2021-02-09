const express = require('express');
const expressLayouts = require('express-ejs-layouts');

module.exports = function(app) {
    app.set('view engine', 'ejs')
    app.set('../views', __dirname + '/views')
    app.set('layout', 'layouts/layout')
    app.use(expressLayouts)
    app.use(express.static('public'))
}