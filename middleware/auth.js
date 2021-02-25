module.exports = {
    ensureAuthenticated: function (req, res, next) {
        //TODO enable accessing
        if (req.isAuthenticated()) { 
            return next()
        }
        req.flash('error_msg', 'Please log in to view this resource')
        res.redirect('/login')
    }
}