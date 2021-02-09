const express = require('express');
const app = express();

require('./startup/db')();
require('./startup/sets')(app);
require('./startup/routes')(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));