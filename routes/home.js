const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { title: "TO ja"})
    // res.render('elo.ejs')
    // res.send('hello')
})

module.exports = router;