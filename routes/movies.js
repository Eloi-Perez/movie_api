const express = require('express'),
    passport = require('passport');

const router = express.Router();
require('../passport.js');


const Models = require('../models.js');
const Movies = Models.Movie;
const Genres = Models.Genre;
const Directors = Models.Director;

//My Functions
///Error 500
const err500 = (err) => {
    console.error(err);
    res.status(500).json({ error: err });
};

/**
* @swagger
* /movies:
*   get:
*       summary: Get all Movies.
*       description: Retrieve the full list of movies and their properties
*       security:
*           - bearerAuth: []
*       responses:
*           200:
*               description: JSON array.
*               content:
*                   application/json:
*                       schema:
*                           $ref: '#/components/schemas/Movies'
*/
router.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .populate('Genre') // (path, select)
        .populate('Director')
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            err500(err)
        });
});

/**
* @swagger
* /movies/featured:
*   get:
*       summary: Get Featured Movies.
*       description: Retrive the featured list of movies and their properties
*       security:
*           - bearerAuth: []
*       responses:
*           200:
*               description: JSON array.
*               content:
*                   application/json:
*                       schema:
*                           $ref: '#/components/schemas/Movies'
*/
router.get('/movies/featured', (req, res) => {
    Movies.find({ "Featured": true })
        .populate({ path: 'Genre', select: 'Name' })
        .populate('Director', 'Name')
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            err500(err)
        });
});

/**
* @swagger
* /movies/{Title}:
*   get:
*       summary: Get one Movie.
*       description: Retrive movie {Title}.
*       parameters:
*       - in: path
*         name: Title
*         required: true
*         description: Title of the movie.
*         schema:
*             type: string
*       security:
*           - bearerAuth: []
*       responses:
*           200:
*               description: JSON object.
*               content:
*                   application/json:
*                       schema:
*                           $ref: "#/components/schemas/Movie"
*/
router.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .populate('Genre').populate('Director').exec((err, mov) => {
            if (err) { return err500(err); }
            res.json(mov);
        })
});

/**
* @swagger
* /genres/{Genre}:
*   get:
*       summary: Get genre info.
*       description: Retrive genre {Genre}.
*       parameters:
*       - in: path
*         name: Genre
*         required: true
*         description: Name of the genre.
*         schema:
*             type: string
*       security:
*           - bearerAuth: []
*       responses:
*           200:
*               description: JSON object.
*               content:
*                   application/json:
*                       schema:
*                           type: object
*                           properties:
*                              _id:
*                                  example: 60720485078f3662d0e67bfa
*                              Name:
*                                  example: Drama
*                              Description:
*                                  example: Focused on emotions and defined by conflict...
*/
router.get('/genres/:Genre', passport.authenticate('jwt', { session: false }), (req, res) => {
    Genres.findOne({ Name: req.params.Genre })
        .then((e) => {
            res.json(e);
        })
        .catch((err) => {
            err500(err)
        });
});

//Get one Director
/**
* @swagger
* /directors/{Director}:
*   get:
*       summary: Get director info.
*       description: Retrive director {Director}.
*       parameters:
*       - in: path
*         name: Director
*         required: true
*         description: Name of the director.
*         schema:
*             type: string
*       security:
*           - bearerAuth: []
*       responses:
*           200:
*               description: JSON object.
*               content:
*                   application/json:
*                       schema:
*                           type: object
*                           properties:
*                              _id:
*                                  example: 60720485078f3662d0e67bfa
*                              Name:
*                                  example: Shane Carruth
*                              Description:
*                                  example: is an American filmmaker, screenwriter, composer, and actor...
*/
router.get('/directors/:Director', passport.authenticate('jwt', { session: false }), (req, res) => {
    Directors.findOne({ Name: req.params.Director })
        .then((e) => {
            res.json(e);
        })
        .catch((err) => {
            err500(err)
        });
});


module.exports = router;