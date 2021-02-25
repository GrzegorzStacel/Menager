require('express-async-errors');
const express = require('express')
const router = express.Router()
const { Game, validate } = require('../models/Game')
const { Company } = require('../models/Company')
const { User } = require('../models/User')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const { ensureAuthenticated } = require('../middleware/auth')

// All Games Route
router.get('/', ensureAuthenticated, async (req, res) => {
    const userData = await User.findOne({
        _id: req.session.passport.user
    })
    const arrayOfUserGames = userData.gamesOwned;

    let query = Game.find({ _id: arrayOfUserGames })
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const games = await query.exec()
        res.render('games/index', {
            games: games,
            userName: userData.name,
            searchOptions: req.query,
            layout: 'layouts/layout'
        })
    } catch {
        res.redirect('/')
    }
})

// New Game Routess
router.get('/new', ensureAuthenticated, async (req, res) => {
    renderFormPage(res, req, new Game(), 'new', false)
})

// Create Game Route
router.post('/', ensureAuthenticated, async (req, res) => {
    try {
        const userData = await User.findOne({
            _id: req.session.passport.user
        })

        const game = new Game({
            title: req.body.title,
            company: req.body.company,
            publishDate: new Date(req.body.publishDate),
            playTime: req.body.playTime,
            description: req.body.description
        })

        const { error } = validate(req.body)
        if (error) {
            return renderFormPage(res, req, game, `new`, true, error.details[0].message)
        }

        const arrayGames = await Game.find({
            _id: userData.gamesOwned
        })

        // Checks for duplicate game names 
        let isGame = false;
        isGame = arrayGames.some(function(item) {
            return item.title === req.body.title
        })

        if (isGame) {
            return renderFormPage(res, req, game, `new`, true, `A game named "${req.body.title}" already exists`)
        }

        saveCover(game, req.body.cover)
    
        game.title = capitalizeFirstLetter(game.title)
        game.description = capitalizeFirstLetter(game.description)

        // # Update user database with his games
        let gamesArray = [];
        if (userData.gamesOwned.length > 0) {
            userData.gamesOwned.forEach( item => {
                gamesArray.push(item);
            })
        }
        gamesArray.push(game._id)
        
        userData.gamesOwned = gamesArray;
        await userData.save();
        // #

        const newGame = await game.save()
        res.redirect(`games/${newGame.id}`)
    } catch (error) {
        console.log(error);
        renderFormPage(res, req, game, 'new', true, "Something went wrong")
    }
})

// Show Game Route
router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const displayUserName = await User.findOne({
            _id: req.session.passport.user
        })
        const game = await Game.findById(req.params.id)
            .populate('company')
            .exec();
        res.render('games/show', {
            game: game,
            userName: displayUserName.name,
            layout: 'layouts/layout'
        })
    } catch (err) {
        console.log(err);
        res.redirect('/')
    }
})

// Edit Game Route
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)
        renderFormPage(res, req, game, 'edit')
    } catch(err) {
        console.log(err);
        res.redirect('/')
    }
})

// Update Game Route
router.put('/:id', ensureAuthenticated, async (req, res) => {
    const game = await Game.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        company: req.body.company,
        publishDate: new Date(req.body.publishDate),
        playTime: req.body.playTime,
        description: req.body.description,
    })

    if (!game) return renderFormPage(res, req, game, 'edit', true, "The game with the given ID was not found"); 

    const { error } = validate(req.body)
    if (error) {
        return renderFormPage(res, req, game, `edit`, true, error.details[0].message)
    }

    saveCover(game, req.body.cover)

    await game.save();
    res.redirect(`/games/${game.id}`)
})

// Delete Game Page
router.delete('/:id', ensureAuthenticated, async (req, res) => {
    const deleteGame = req.params.id;
    const game = await Game.findByIdAndDelete(deleteGame);

    if(!game) return renderFormPage(res, req, game, 'show', true, "The game with the given ID was not found.");

    // # Delete game from User's data base
    const updateUserGames = await User.findOne({
        _id: req.session.passport.user
    })

    let gamesArray = updateUserGames.gamesOwned;
        
    const index = gamesArray.indexOf(deleteGame);
    if (index > -1) {
        gamesArray.splice(index, 1);
    }

    updateUserGames.gamesOwned = gamesArray;
    await updateUserGames.save();
    // # 

    req.flash('success_msg', `The game '${game.title}' has been successfully removed`)
    res.redirect('/games')
})


// Middleware

async function renderFormPage(res, req, game, form, hasError = false, message = '') {
    try {
        const displayUserName = await User.findOne({
            _id: req.session.passport.user
        })

        const companies = await Company.find({
            _id: displayUserName.gamesCompanies
        });

        const params = {
            companies: companies,
            game: game,
            userName: displayUserName.name,
            layout: 'layouts/layout'
        }
        if (hasError) {
            message = editAlertMessage(message);
            params.error_msg = message;
        }
        res.render(`games/${form}`, params)
    } catch (error) {
        console.log(error);
        res.redirect('/games')
    }
}

function saveCover(game, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        game.coverImage = new Buffer.from(cover.data, 'base64')
        game.coverImageType = cover.type
    }
}

function editAlertMessage(message) {
    if (message.search('title') !== -1) {
        return message.replace('title', "Title")
    } else if (message.search('description') !== -1) {
        return message.replace('description', "Description")
    } else if (message.search('publishDate') !== -1) {
        return message.replace('publishDate', "Publish Date")
    } else if (message.search('playTime') !== -1) {
        return message.replace('playTime', "Scheduled game time")
    } else if (message.search('cover') !== -1) {
        return message.replace('cover', "Cover")
    } else return message
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = router