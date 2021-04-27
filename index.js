const express = require('express'),
    cors = require('cors'),
    mongoose = require('mongoose'),
    morgan = require('morgan');

require('dotenv').config();

const users = require('./routes/users.js');
const movies = require('./routes/movies.js');

const app = express();
app.use(express.json());
// app.use(express.urlencoded({extended: true})); // for res data like-> let data = "key1=value1&key2=value2"

app.use(morgan('common'));

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

//My Functions
///Check for empty array variable
function isEmpty(myVar) {
    for (var key in myVar) {
        if (myVar.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

//CORS
let allowedOrigins = ['http://localhost:8080', 'http://test.com'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

//execute more middlewares here

app.use((err, req, res, next) => {
    //if (err) //why 'if' not needed?
    console.error(err.stack);
    res.status(500).send('Something broke!'); //will work nly when app start
})

// app.use((err, req, res, next) => {
//     if (err) {
//     console.error(err.stack);
//     res.status(500).send('Something broke!'); 
//     } else {
//         next();
//     }
// })

//Routes
app.use('/', users);
app.use('/', movies);
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Time Travel Films API</h1><br><a href="/documentation.html">DOCUMENTATION</a>');
});
app.get('/documentation.html', (req, res) => {
    res.sendFile('docs/documentation.html', { root: __dirname })
});

//Error404
app.use(function (req, res, next) {
    res.status(404).sendFile('docs/documentation.html', { root: __dirname });
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});