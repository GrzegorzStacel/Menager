const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session')
const flash = require('connect-flash')


module.exports = function (app, passport) {
    // EJS
    app.set('view engine', 'ejs')
    app.use(expressLayouts)

    app.set('../views', __dirname + '/views')
    app.set('layout', 'layouts/layout')
    app.use(express.static('public'))

    // Bodyparser
    app.use(express.urlencoded({
        extended: false
    }))

    // Express Session
    app.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    }))

    // Passport middleware
    app.use(passport.initialize())
    app.use(passport.session())

    // Connect flash
    app.use(flash())
}