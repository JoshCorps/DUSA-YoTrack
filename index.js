'use strict';

let express = require('express');
let app = express();

let path = require('path');

app.get('/*', express.static(path.join(__dirname, 'public')));

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server running.");
});