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
    res.status(500).json({error: err});
};



//Get all Movies
router.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            err500(err)
        });
});

//Get Movies Featured
router.get('/movies/featured', (req, res) => {
    Movies.find({ "Featured": true })
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            err500(err)
        });
});

//Get one Movie
router.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .populate('Genre').populate('Director').exec((err, mov) => {
            if (err) { return err500(err); }
            res.json(mov);
        })
});

//Get one Genre
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