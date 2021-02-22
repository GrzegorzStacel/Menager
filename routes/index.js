const express = require('express')
const router = express.Router()
const Game = require('../models/Game')
const { ensureAuthenticated } = require('../middleware/auth')

// Welcome page
router.get('/', (req, res) => {
    res.render('manageAccess/welcome')
})

// Dashboard
router.get('/index', ensureAuthenticated, async (req, res) => {
    let games = []
    try {
        games = await Game.find().sort({ createdAt: 'desc' }).limit(10).exec()
    } catch {
        games = []
    }
    res.render('app/index', { games: games, layout: 'layouts/layout' })
})

module.exports = router;