require('express-async-errors');
const express = require('express')
const router = express.Router()
const { Game, validate } = require('../models/Game')
const Company = require('../models/Company')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const { ensureAuthenticated } = require('../middleware/auth')

// All Games Route
router.get('/', ensureAuthenticated, async (req, res) => {
    let query = Game.find()
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
            searchOptions: req.query,
            layout: 'layouts/layout'
        })
    } catch {
        res.redirect('/')
    }
})

// New Game Route
router.get('/new', ensureAuthenticated, async (req, res) => {
    renderFormPage(res, new Game(), 'new', false)
})

// Create Game Route
router.post('/', ensureAuthenticated, async (req, res) => {
    const game = new Game({
        title: req.body.title,
        company: req.body.company,
        publishDate: new Date(req.body.publishDate),
        playTime: req.body.playTime,
        description: req.body.description
    })

    const { error } = validate(req.body)
    if (error) {
        return renderFormPage(res, game, `new`, true, error.details[0].message)
    }

    let isGame = await Game.findOne({
        title: req.body.title
    })

    if (isGame) {
        renderFormPage(res, game, `new`, true, `A game named "${isGame.title}" already exists`)
        return
    }

    saveCover(game, req.body.cover)

    try {
        game.title = capitalizeFirstLetter(game.title)
        game.description = capitalizeFirstLetter(game.description)

        const newGame = await game.save()
        res.redirect(`games/${newGame.id}`)
    } catch (error) {
        console.log(error);
        renderFormPage(res, game, 'new', true, "Something went wrong")
    }
})

// Show Game Route
router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)
            .populate('company')
            .exec();
        res.render('games/show', {
            game: game,
            layout: 'layouts/layout'
        })
    } catch {
        res.redirect('/')
    }
})

// Edit Game Route
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)
        renderFormPage(res, game, 'edit')
    } catch {
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

    if (!game) return renderFormPage(res, game, 'edit', true, "The game with the given ID was not found"); 

    const { error } = validate(req.body)
    if (error) {
        return renderFormPage(res, game, `edit`, true, error.details[0].message)
    }

    saveCover(game, req.body.cover)

    await game.save();
    res.redirect(`/games/${game.id}`)
})

// Delete Game Page
router.delete('/:id', ensureAuthenticated, async (req, res) => {s
        const game = await Game.findByIdAndDelete(req.params.id);

        if(!game) return renderFormPage(res, game, 'show', true, "The game with the given ID was not found.");

        console.log('/games');
        res.redirect('/games')
})


// Middleware

async function renderFormPage(res, game, form, hasError = false, message = '') {
    try {
        const companies = await Company.find({});
        const params = {
            companies: companies,
            game: game,
            layout: 'layouts/layout'
        }
        if (hasError) {
            message = editAlertMessage(message);
            params.error_msg = message;
        }
        // console.log('renderFormPage params', 'form: ', form);
        res.render(`games/${form}`, params)
    } catch (error) {
        // console.log('renderFormPage catch errrrrrror: ', error);
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