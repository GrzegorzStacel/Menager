const index = require('../routes/index');
const users = require('../routes/users');

module.exports = function(app) {
    app.use('/', index);
    app.use('/', users);
}