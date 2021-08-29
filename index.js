const express = require('express'),
    cors = require('cors'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    fs = require('fs');

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');

require('dotenv').config();

const swaggerDefinition = require('./swagger-def.js');
const swaggerOptions = {
    swaggerDefinition,
    apis: ['index.js', './routes/*.js'],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);

const users = require('./routes/users.js');
const movies = require('./routes/movies.js');

const app = express();
app.use(express.json());
// app.use(express.urlencoded({extended: true})); // for res data like-> let data = "key1=value1&key2=value2"

app.use(morgan('common'));

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

//CORS
let allowedOrigins = ['https://movie-client2.netlify.app', 'https://eloi-perez.github.io'];
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


//Routes
app.use('/', movies);
app.use('/', users);

// Documentation with SwaggerUI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
* @swagger
* /:
*   get:
*       summary: Welcome root route.
*       description: HTML page.
*       responses:
*           200:
*               description: HTML page.
*               content: 
*                   text/html: {}
*/
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Time Travel Films API</h1><br><a href="/docs">DOCUMENTATION</a>');
});

/**
* 
* /documentation.html:
*   get:
*       summary: Get Documentation.
*       description: HTML documentation page.
*       responses:
*           200:
*               description: HTML documentation page.
*               content: 
*                   text/html: {}
*/
// app.get('/documentation.html', (req, res) => {
//     res.sendFile('docs/documentation.html', { root: __dirname })
// });

/**
* @swagger
* /img/{Title}:
*   get:
*       summary: Get Images by Title
*       description: Movies images.
*       parameters:
*       - in: path
*         name: Title
*         required: true
*         description: Title of the movie.
*         schema: { 'type': 'string', 'items': {} }
*       responses:
*           200:
*               description: .jpg Movies images.
*               content:
*                   image/jpeg: {}
*           404:
*               description: Title not found.
*/
app.get('/img/:Title', (req, res) => {
    fs.access(`public/images/${req.params.Title}.jpg`, fs.constants.R_OK, (err) => {
        if (err) {
            console.error('File does not exist\nPath: ' + err.path);
            res.status(404).json({ Error: req.params.Title + ' image was not found' });
        } else {
            res.sendFile(`public/images/${req.params.Title}.jpg`, { root: __dirname });
        }
    });
});


//Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ Error: 'Something broke!' });
    // res.status(500).json({ Error: err.toString() });
});

//Error404
app.use(function (req, res, next) {
    res.status(404).sendFile('docs/documentation.html', { root: __dirname });
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});