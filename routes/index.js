const express = require('express')
const router = express.Router()
const { Game } = require('../models/Game')
const { User } = require('../models/User')
const { ensureAuthenticated } = require('../middleware/auth')

// Welcome page
router.get('/', (req, res) => {
    res.render('manageAccess/welcome')
})

// Dashboard
router.get('/index', ensureAuthenticated, async (req, res) => {
    let games = []
    try {
        const updateUserGames = await User.findOne({
            _id: req.session.passport.user
        })
        const arrayOfUserGames = updateUserGames.gamesOwned;
        games = await Game.find({ _id: arrayOfUserGames }).sort({ createdAt: 'desc' }).limit(10).exec()
    } catch(err) {
        games = []
        console.log(err);
    }

    const displayUserName = await User.findOne({
        _id: req.session.passport.user
    })

    res.render('app/index', {
        games: games,
        userName: displayUserName.name,
        layout: 'layouts/layout'
    })
})

module.exports = router;