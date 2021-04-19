const express = require('express'),
    cors = require('cors'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    morgan = require('morgan');

const app = express();
app.use(express.json());
// app.use(express.urlencoded({extended: true}));

// app.use(cors());//by Default all origins
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

require('./passport.js');
let auth = require('./auth')(app);

const Models = require('./models.js');

const Movies = Models.Movie;
const Genres = Models.Genre;
const Directors = Models.Director;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const err500 = (err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
};

//Check for empty array variable
function isEmpty(myVar) {
    for (var key in myVar) {
        if (myVar.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}


// app.get('/', function (req, res, next) {
//     next();
// })
app.use(morgan('common'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})


app.get('/', (req, res) => {
    res.send('Welcome to the Time Travel Films API');
});

app.get('/documentation.html', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname })
});

//Get all Movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            err500(err)
        });
});

//Get one Movie
app.get('/movies/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .populate('Genre').populate('Director').exec((err, mov) => {
            if (err) { return err500(err); }
            res.json(mov);
        })
});

//Get one Genre
app.get('/genres/:Genre', (req, res) => {
    Genres.findOne({ Name: req.params.Genre })
        .then((e) => {
            res.json(e);
        })
        .catch((err) => {
            err500(err)
        });
});

//Get one Director
app.get('/directors/:Director', (req, res) => {
    Directors.findOne({ Name: req.params.Director })
        .then((e) => {
            res.json(e);
        })
        .catch((err) => {
            err500(err)
        });
});

//Get all users
// app.get('/users', (req, res) => {
//     Users.find()
//     .then((users) => {
//         res.status(200).json(users);
//     })
//     .catch((err) => {
//         console.error(err);
//         res.status(500).send('Error: ' + err);
//     });
// });

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .populate('myMovies.Movie')
        .then((user) => {
            user.Password = "";
            res.json(user);
        })
        .catch((err) => {
            err500(err)
        });
});

//Add an user
app.post('/users', (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send('Username: ' + req.body.Username + ' already exist');
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    BirthDate: req.body.BirthDate
                })
                    .then((user) => { user.Password = ""; res.status(201).json(user); })
                    .catch((err) => {
                        console.error(err);
                        res.status(400).send('Error: ' + err);
                    })
            }
        })
        .catch((err) => {
            err500(err)
        });

});

// Update a user's info, by username
app.put('/users/:Username', (req, res) => {//req old password and token
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            BirthDate: req.body.BirthDate
        }
    },
        { new: true, omitUndefined: true },
        (err, updatedUser) => {
            if (err) {
                err500(err)
            } else {
                if (updatedUser) {
                    updatedUser.Password = "";
                    res.json(updatedUser);
                } else {
                    res.status(400).send(req.params.Username + ' was not found');
                }
            }
        }
    );
});

// Delete a user by username
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            err500(err)
        });
});


//Get user's myMovies -> Just use Get User


// Add a movie to users's myMovies
app.post('/users/:Username/myMovies', (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            Movies.findOne({ Title: req.body.Movie })
                .then((mov) => {
                    if (!user && !mov) {
                        return res.status(400).send(req.params.Username + ' was not found \nand\n' + req.body.Movie + ' was not found');
                    } else if (!user) {
                        return res.status(400).send(req.params.Username + ' was not found');
                    } else if (!mov) {
                        return res.status(400).send(req.body.Movie + ' was not found');
                    } else if (user && mov) {
                        Users.find({ Username: req.params.Username, "myMovies.Movie": mongoose.Types.ObjectId(mov._id) })
                            .then(movInUser => {
                                if (!isEmpty(movInUser)) {
                                    return res.status(400).send(req.body.Movie + ' already exist in ' + req.params.Username + '\'s myMovies');
                                } else if (isEmpty(movInUser)) {
                                    Users.findOneAndUpdate({ Username: req.params.Username },
                                        {
                                            $push: {
                                                myMovies: [
                                                    {
                                                        Movie: mongoose.Types.ObjectId(mov._id),
                                                        Score: req.body.Score,
                                                        RelevanceTT: req.body.RelevanceTT,
                                                        PlanToWatch: req.body.PlanToWatch,
                                                        Favorite: req.body.Favorite
                                                    }
                                                ]
                                            }
                                        }, { validateModifiedOnly: true, new: true }) //omitUndefined: true,
                                        .then((updatedUser) => {
                                            return res.status(201).json(updatedUser);
                                        }).catch(err => err500(err));
                                }
                            }).catch(err => err500(err));
                    }
                }).catch(err => err500(err));
        }).catch(err => err500(err));


});

// Update a movie to a user's list of favorites
app.put('/users/:Username/myMovies', (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            Movies.findOne({ Title: req.body.Movie })
                .then((mov) => {
                    if (!user && !mov) {
                        return res.status(400).send(req.params.Username + ' was not found \nand\n' + req.body.Movie + ' was not found');
                    } else if (!user) {
                        return res.status(400).send(req.params.Username + ' was not found');
                    } else if (!mov) {
                        return res.status(400).send(req.body.Movie + ' was not found');
                    } else if (user && mov) {
                        Users.findOneAndUpdate({ Username: req.params.Username, "myMovies.Movie": mongoose.Types.ObjectId(mov._id) },
                            {
                                $set: {
                                    'myMovies.$[elem].Score': req.body.Score,
                                    'myMovies.$[elem].RelevanceTT': req.body.RelevanceTT,
                                    'myMovies.$[elem].PlanToWatch': req.body.PlanToWatch,
                                    'myMovies.$[elem].Favorite': req.body.Favorite
                                }
                            }, { arrayFilters: [{ 'elem.Movie': mongoose.Types.ObjectId(mov._id) }], validateModifiedOnly: true, omitUndefined: true, new: true })
                            .then((updatedUser) => {
                                return res.status(201).json(updatedUser);
                            }).catch(err => err500(err));
                    }
                }).catch(err => err500(err));
        }).catch(err => err500(err));
});


app.use(function (req, res, next) {
    res.status(404).sendFile('public/documentation.html', { root: __dirname });
});


app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

// Logging
// User authentication
// App routing