module.exports = {
    ensureAuthenticated: function (req, res, next) {
        // if (req.isAuthenticated()) { //TODO enable accessing
            return next()
        // }
        req.flash('error_msg', 'Please log in to view this resource')
        res.redirect('/login')
    }
}