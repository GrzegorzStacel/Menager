const express = require('express')
const router = express.Router()
const { Company, validate } = require('../models/Company')
const { Game } = require('../models/Game')
const { User } = require('../models/User')
const { ensureAuthenticated } = require('../middleware/auth')
const getDateAndTime = require('../startup/defaultDataForNewUser/dataTime')

// All Companies Route
router.get('/', ensureAuthenticated, (req, res) => {
    renderCompaniesIndex(req, res);
})

// New Company Route
router.get('/new', ensureAuthenticated, async (req, res) => {
    const displayUserName = await User.findOne({
        _id: req.session.passport.user
    })
    
    res.render('companies/new', {
        company: new Company(),
        userName: displayUserName.name,
        layout: 'layouts/layout'
    })
})

// Create Company Route
router.post('/', ensureAuthenticated, async (req, res) => {
    const userData = await User.findOne({
        _id: req.session.passport.user,
    })

    const company = new Company({
        name: req.body.name,
        whoCreate: req.user.name,
        createdAt: getDateAndTime()
    })

    const { error } = validate(req.body)
    if (error) {
        return res.render('companies/new', {
            company: company,
            error_msg: editAlertMessage(error.details[0].message),
            userName: userData.name,
            layout: 'layouts/layout'
        })
    }

    try {

        const arrayCompanies = await Company.find({
            _id: userData.gamesCompanies
        })
    
        let isCompany = false;
        isCompany = arrayCompanies.some(function(item) {
            return item.name === req.body.name;
        })

        if (isCompany) {
            res.render('companies/new', {
                company: req.body.name,
                error_msg: `A company named ${req.body.name} already exists`,
                userName: userData.name,
                layout: 'layouts/layout'
            })

        } else {
            const newCompany = await company.save();

            userData.gamesCompanies.push(company._id);
            await userData.save();

            res.redirect(`companies/${newCompany.id}`)
        }
    } catch (error) {
        res.render('companies/new', {
            company: req.body.name,
            error_msg: `Sorry, but something went wrong...`,
            userName: userData.name,
            layout: 'layouts/layout'
        })
    }
})

// Specifically Company Route
router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)

        const displayUserName = await User.findOne({
            _id: req.session.passport.user
        })

        const games = await Game
            .find({ company: company.id })
            .limit(6)
            .exec()

        res.render('companies/show', {
            company: company,
            gamesByCompany: games,
            userName: displayUserName.name,
            layout: 'layouts/layout'
        })
    } catch(err) {
        res.redirect(`/companies`)
    }
})

// Specifically Edit Company Route
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
    try {
        const displayUserName = await User.findOne({
            _id: req.session.passport.user
        })

        const company = await Company.findById(req.params.id)
        res.render('companies/edit', {
            company: company,
            userName: displayUserName.name,
            layout: 'layouts/layout'
        })
    } catch {
        res.redirect("/companies")
    }
})

router.put('/:id', ensureAuthenticated, async (req, res) => {
    
    let company, displayUserName;

    try {
        displayUserName = await User.findOne({
            _id: req.session.passport.user
        })

        company = await Company.findById(req.params.id)
   
        const { error } = validate(req.body)
        if (error) {
            return res.render(`companies/edit`, {
                company: company,
                error_msg: editAlertMessage(error.details[0].message),
                userName: displayUserName.name,
                layout: 'layouts/layout'
            })
        }
   
        company.name = req.body.name;
        await company.save();
        res.redirect(`/companies/${company.id}`)
    } catch {
        if (company == null) {
            res.redirect('/')
        } else {
            res.render('companies/edit', {
                company: company,
                error_msg: 'Error updating Company',
                userName: displayUserName.name,
                layout: 'layouts/layout'
            })
        }
    }
})

router.delete('/:id', ensureAuthenticated, async (req, res) => {
    let company;
    const deleteCompany = req.params.id;
    
    try {
        company = await Company.findById(deleteCompany)
        await company.remove();

        // # Delete company from User's data base
        const userData = await User.findOne({
            _id: req.session.passport.user
        })
    
        let companiesArray = userData.gamesCompanies;
            
        const index = companiesArray.indexOf(deleteCompany);
        if (index > -1) {
            companiesArray.splice(index, 1);
        }
    
        userData.gamesCompanies = companiesArray;
        await userData.save();

        res.redirect(`/companies`)
    } catch (err) {
        if (company == null) {
            res.redirect('/')
        } else {
            renderCompaniesIndex(req, res, err);
        }
    }
})

async function renderCompaniesIndex(req, res, err = '') {
    try {
        let searchOptions = {};

        const userData = await User.findOne({
            _id: req.session.passport.user
        })

        const userGamesCompanies = userData.gamesCompanies;

        let companies;
        if (req.query.name != null && req.query.name !== '') {
            searchOptions.name = new RegExp(req.query.name, 'i');
            searchOptions._id = userGamesCompanies;
         
            companies = await Company.find(searchOptions);
        } else {
            companies = await Company.find({ _id: userGamesCompanies });
        }

        res.render('companies/index', {
            companies: companies,
            searchOptions: req.query,
            error_msg: err,
            userName: userData.name,
            layout: 'layouts/layout'
        })
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
}

function editAlertMessage(message) {
    if (message.search('name') !== -1) {
        return message.replace('name', "Name")
    } else return message
}

module.exports = router