const express = require('express');
const app = express();
const passport = require('passport')

require('./startup/db')();
require('./startup/sets')(app, passport);
require('./startup/globalVars')(app);
require('./startup/routes')(app);
require('./registerConfig/password')(passport);


const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));