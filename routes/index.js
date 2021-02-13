const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../middleware/auth')

// Welcome page
router.get('/', (req, res) => {
    res.render('manageAccess/welcome')
})

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('app/dashboard', {
        name: req.user.name
    })
})

module.exports = router;