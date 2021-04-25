const express = require('express'),
    cors = require('cors'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    morgan = require('morgan');

const { check, validationResult } = require('express-validator');

require('dotenv').config();

const app = express();
app.use(express.json());
// app.use(express.urlencoded({extended: true})); // for res data like-> let data = "key1=value1&key2=value2"

app.use(morgan('common'));


require('./passport.js');
let auth = require('./auth')(app);

const Models = require('./models.js');

const Movies = Models.Movie;
const Genres = Models.Genre;
const Directors = Models.Director;
const Users = Models.User;
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

//My Functions
///Error 500
const err500 = (err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
};
///Check for empty array variable
function isEmpty(myVar) {
    for (var key in myVar) {
        if (myVar.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}
///Compare Passport User and URL :User
function checkUser(req, res, next) {
    if (req.user.Username === req.params.Username) {
        next()
    } else {
        return res.status(401).send('Unauthorized');
    }
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
    res.status(500).send('Something broke!');
})


app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Time Travel Films API</h1><br><a href="/documentation.html">DOCUMENTATION</a>');
});

app.get('/documentation.html', (req, res) => {
    res.sendFile('docs/index.html', { root: __dirname })
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

//Get Movies Featured
app.get('/movies/featured', (req, res) => {
    Movies.find({ "Featured": true })
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            err500(err)
        });
});

//Get one Movie
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .populate('Genre').populate('Director').exec((err, mov) => {
            if (err) { return err500(err); }
            res.json(mov);
        })
});

//Get one Genre
app.get('/genres/:Genre', passport.authenticate('jwt', { session: false }), (req, res) => {
    Genres.findOne({ Name: req.params.Genre })
        .then((e) => {
            res.json(e);
        })
        .catch((err) => {
            err500(err)
        });
});

//Get one Director
app.get('/directors/:Director', passport.authenticate('jwt', { session: false }), (req, res) => {
    Directors.findOne({ Name: req.params.Director })
        .then((e) => {
            res.json(e);
        })
        .catch((err) => {
            err500(err)
        });
});

// //Get all users
// app.get('/users', (req, res) => { //Admin auth?
//     Users.find()
//     .then((users) => {
//         res.status(200).json({user: users.map( userItem => ({ Username: userItem.Username, myMovies: userItem.myMovies }) ) });
//     })
//     .catch((err) => {
//         console.error(err);
//         res.status(500).send('Error: ' + err);
//     });
// });

// Get a user by username + myMovies list in User
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), checkUser, (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .populate('myMovies.Movie')
        .then((user) => {
            res.status(200).json({ Username: user.Username, myMovies: user.myMovies });
        })
        .catch((err) => {
            err500(err)
        });
});

//Add an user
app.post('/users', [                 
    // Validation logic for request
    check('Username', 'Username is required').isLength({ min: 3 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').normalizeEmail().isEmail()
], (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
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
                    .then((user) => {  //could generete JWT here
                        res.status(201).json({Message: "Created Successfully", Username: user.Username});
                    })
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
app.put('/users', passport.authenticate('local', { session: false }), [
    check('NewUsername', 'Username is required').optional().isLength({ min: 3 }),
    check('NewUsername', 'Username contains non alphanumeric characters - not allowed.').optional().isAlphanumeric(),
    check('NewPassword', 'Password is required').optional().not().isEmpty(),
    check('NewEmail', 'Email does not appear to be valid').optional().normalizeEmail().isEmail()
], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(422).json({ errors: errors.array() }); }
    let hashedPassword;
    if (req.body.NewPassword) {
        hashedPassword = Users.hashPassword(req.body.NewPassword);
    }
    Users.findOneAndUpdate({ Username: req.body.Username }, {
        $set:
        {
            Username: req.body.NewUsername,
            Password: hashedPassword,
            Email: req.body.NewEmail,
            BirthDate: req.body.BirthDate
        }
    },
        { new: true, omitUndefined: true },
        (err, updatedUser) => {
            if (err) {
                err500(err)
            } else {
                if (updatedUser) {
                    res.status(200).json({Message: "Updated Successfully", Username: updatedUser.Username});
                } else {
                    res.status(400).send(req.params.Username + ' was not found');
                }
            }
        }
    );
});

// Delete a user by username
app.delete('/users', passport.authenticate('local', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.body.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.body.Username + ' was not found');//not in use because auth
            } else {
                res.status(200).send(req.body.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            err500(err)
        });
});


// Add a movie to users's myMovies
app.post('/users/:Username/myMovies', passport.authenticate('jwt', { session: false }), checkUser, (req, res) => {
    Movies.findOne({ Title: req.body.Movie })
        .then((mov) => {
            if (!mov) {
                return res.status(400).send(req.body.Movie + ' was not found');
            } else if (mov) {
                Users.find({ Username: req.params.Username, "myMovies.Movie": mongoose.Types.ObjectId(mov._id) })
                    .then(movInUser => {
                        if (!isEmpty(movInUser)) {
                            return res.status(400).send(req.body.Movie + ' already exist in ' + req.params.Username + '\'s myMovies');
                        } else if (isEmpty(movInUser)) {
                            Users.findOneAndUpdate({ Username: req.user.Username },
                                {                   //Using User from Token
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
                                }, { validateModifiedOnly: true, new: true })
                                .then((updatedUser) => {
                                    return res.status(201).json({ Username: updatedUser.Username, myMovies: updatedUser.myMovies });
                                }).catch(err => err500(err));
                        }
                    }).catch(err => err500(err));
            }
        }).catch(err => err500(err));
});

// Update a movie to a user's list of favorites
app.put('/users/:Username/myMovies', passport.authenticate('jwt', { session: false }), checkUser, (req, res) => {
    Movies.findOne({ Title: req.body.Movie })
        .then((mov) => {
            if (!mov) {
                return res.status(400).send(req.body.Movie + ' was not found');
            } else if (mov) {
                Users.findOneAndUpdate({ Username: req.user.Username, "myMovies.Movie": mongoose.Types.ObjectId(mov._id) },
                    {
                        $set: {
                            'myMovies.$[elem].Score': req.body.Score,
                            'myMovies.$[elem].RelevanceTT': req.body.RelevanceTT,
                            'myMovies.$[elem].PlanToWatch': req.body.PlanToWatch,
                            'myMovies.$[elem].Favorite': req.body.Favorite
                        }
                    }, { arrayFilters: [{ 'elem.Movie': mongoose.Types.ObjectId(mov._id) }], validateModifiedOnly: true, omitUndefined: true, new: true })
                    .then((updatedUser) => {
                        return res.status(200).json({ Username: updatedUser.Username, myMovies: updatedUser.myMovies });
                    }).catch(err => err500(err));
            }
        }).catch(err => err500(err));
});


app.use(function (req, res, next) {
    res.status(404).sendFile('docs/', { root: __dirname });
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});