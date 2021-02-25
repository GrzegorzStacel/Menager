const index = require('../routes/index');
const users = require('../routes/users');
const companies = require('../routes/companies');
const games = require('../routes/games');

module.exports = function(app) {
    app.use('/', index);
    //TODO enable accessing
    app.use('/', users); 
    app.use('/companies', companies);
    app.use('/games', games);

}