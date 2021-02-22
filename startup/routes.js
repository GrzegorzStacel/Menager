const index = require('../routes/index');
const users = require('../routes/users');
const companies = require('../routes/companies');
const games = require('../routes/games');

module.exports = function(app) {
    app.use('/', index);
    // app.use('/', users); //TODO enable accessing
    app.use('/companies', companies);
    app.use('/games', games);

}