const express = require('express')
const router = express.Router()
const Company = require('../models/Company')
const Game = require('../models/Game')
const { ensureAuthenticated } = require('../middleware/auth')


// All Companies Route
router.get('/', ensureAuthenticated, async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }

    try {
        const companies = await Company.find(searchOptions)
        res.render('companies/index', {
            companies: companies,
            searchOptions: req.query,
            layout: 'layouts/layout'
        })
    } catch (error) {
        res.redirect('/')
    }


})

// New Company Route
router.get('/new', ensureAuthenticated, (req, res) => {
    res.render('companies/new', {
        company: new Company(),
        layout: 'layouts/layout'
    })
})

// Create Company Route
router.post('/', ensureAuthenticated, async (req, res) => {
    const company = new Company({
        name: req.body.name
    })

    try {
        let isCompany = await Company.findOne({ name: req.body.name })
        if (isCompany) {
            res.render('companies/new', {
                company: isCompany,
                errorMessage: `Error: A company named ${req.body.name} already exists`,
                layout: 'layouts/layout'
            })
        } else {
            const newCompany = await company.save();
            res.redirect(`companies/${newCompany.id}`)
        }
    } catch (error) {
        res.render('companies/new', {
            company: company,
            errorMessage: 'Error creating Company',
            layout: 'layouts/layout'
        })
    }
})

router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)
        const games = await Game.find({
            company: company.id
        }).limit(6).exec()
        res.render('companies/show', {
            company: company,
            gamesByCompany: games,
            layout: 'layouts/layout'
        })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id', ensureAuthenticated, (req, res) => {
    res.send('show companies ' + req.params.id)
})

router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)
        res.render('companies/edit', {
            company: company,
            layout: 'layouts/layout'
        })
    } catch {
        res.redirect("/companies")
    }
})

router.put('/:id', ensureAuthenticated, async (req, res) => {
    let company;
    try {
        company = await Company.findById(req.params.id)
        company.name = req.body.name;
        await company.save();
        res.redirect(`/companies/${company.id}`)
    } catch {
        if (company == null) {
            res.redirect('/')
        } else {
            res.render('companies/edit', {
                company: company,
                errorMessage: 'Error updating Company',
                layout: 'layouts/layout'
            })
        }
    }
})

router.delete('/:id', ensureAuthenticated, async (req, res) => {
    let company;
    try {
        company = await Company.findById(req.params.id)
        await company.remove();
        res.redirect(`/companies`)
    } catch (err){
        if (company == null) {
            res.redirect('/')
        } else {
        //     console.log(err.message);
            res.redirect(`/companies/${company.id}`)
        //     // res.redirect(`companies/${req.params.id}`, { errorMessage: err })
        //     res.render(`companies/${company.id}`, {
        //         company: company,
        //         errorMessage: 'Error creating Company'
            // })
        }
        // if (company != null) {
        //     res.render(`/companies/${company.id}`, {
        //         company: company,
        //         errorMessage: 'Could not remove game'
        //     })
        // } else {
        //     res.redirect('/')
        // }
    }
})


module.exports = router