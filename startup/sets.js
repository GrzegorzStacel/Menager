require('express-async-errors')
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session')
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')


module.exports = function (app, passport) {
    app.set('view engine', 'ejs')
    app.set('../views', __dirname + '/views')
    app.set('layout', 'layouts/layoutAccess')
    app.use(expressLayouts)
    app.use(methodOverride('_method'))
    app.use(express.static('public'))
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

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