const express = require('express'),
    jwt = require('jsonwebtoken'),
    passport = require('passport'),
    mongoose = require('mongoose');

const { check, validationResult } = require('express-validator');

const router = express.Router();
require('../passport.js');

const Models = require('../models.js');
const Movies = Models.Movie;
const Users = Models.User;

//My Functions
///Error 500
const err500 = (err) => {
    console.error(err);
    res.status(500).json({error: err});
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
// const myObj = {};
// !!Object.keys(myObj).length; //!! -> true or false
///Compare Passport User and URL :User
function checkUser(req, res, next) {
    if (req.user.Username === req.params.Username) {
        next()
    } else {
        return res.status(401).json({error: 'Unauthorized'});
    }
}


const generateJWTToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_KEY, {
        subject: payload.Username, // Username to encode in the JWToken
        expiresIn: '14d',
        algorithm: 'HS256'
    });
}

//Add an user
router.post('/users', [
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
                return res.status(400).json({ Message: 'Username: ' + req.body.Username + ' already exist'});
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    BirthDate: req.body.BirthDate
                })
                    .then((user) => {  
                        //generete JWT here
                        req.login(user, { session: false }, (err) => {
                            if (err) {
                                res.json({ Error: err });
                            }
                            let payload = {}
                            payload._id = user._id;
                            payload.Username = user.Username;
                            let token = generateJWTToken(payload);
                            return res.status(201).json({ Message: "Created Successfully", Username: user.Username, token });
                        });                        
                    })
                    .catch((err) => {
                        console.error(err);
                        res.status(400).json({ Error: err });
                    })
            }
        })
        .catch((err) => {
            err500(err)
        });
});

/* POST login. */
router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
        if (error || !user) {
            return res.status(400).json({
                Message: 'Something is not right',
                // user: user,
                Error: info
            });
        }
        req.login(user, { session: false }, (error) => {
            if (error) {
                res.json({ Error: error });
            }
            let payload = {}
            payload._id = user._id;
            payload.Username = user.Username;
            // let token = generateJWTToken(user.toJSON()); // this generate token with full user info
            let token = generateJWTToken(payload);
            return res.json({ Username: user.Username, token });
        });
    })(req, res);
});

// //Get all users
// app.get('/users', (req, res) => { //Admin auth?
//     Users.find()
//     .then((users) => {
//         res.status(200).json({user: users.map( userItem => ({ Username: userItem.Username, myMovies: userItem.myMovies }) ) });
//     })
//     .catch((err) => {
//         console.error(err);
//         res.status(500).json({ Error: err });
//     });
// });

// Get a user by username + myMovies list in User
router.get('/users/:Username', passport.authenticate('jwt', { session: false }), checkUser, (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .populate('myMovies.Movie')
        .then((user) => {
            res.status(200).json({ Username: user.Username, myMovies: user.myMovies });
        })
        .catch((err) => {
            err500(err)
        });
});



// Update a user's info, by username
router.put('/users', passport.authenticate('local', { session: false }), [
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
                    res.status(200).json({ Message: "Updated Successfully", Username: updatedUser.Username });
                } else {
                    res.status(400).json({ Message: req.params.Username + ' was not found'});
                }
            }
        }
    );
});

// Delete a user by username
router.delete('/users', passport.authenticate('local', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.body.Username })
        .then((user) => {
            if (!user) {
                res.status(400).json({ Message: req.body.Username + ' was not found' });//not in use because auth
            } else {
                res.status(200).json({ Message: req.body.Username + ' was deleted.' });
            }
        })
        .catch((err) => {
            err500(err)
        });
});

// Add a movie to users's myMovies
router.post('/users/:Username/myMovies', passport.authenticate('jwt', { session: false }), checkUser, (req, res) => {
    Movies.findOne({ Title: req.body.Movie })
        .then((mov) => {
            if (!mov) {
                return res.status(400).json({ Message: req.body.Movie + ' was not found' });
            } else if (mov) {
                Users.find({ Username: req.params.Username, "myMovies.Movie": mongoose.Types.ObjectId(mov._id) })
                    .then(movInUser => {
                        if (!isEmpty(movInUser)) {
                            return res.status(400).json({ Message: req.body.Movie + ' already exist in ' + req.params.Username + '\'s myMovies' });
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
router.put('/users/:Username/myMovies', passport.authenticate('jwt', { session: false }), checkUser, (req, res) => {
    Movies.findOne({ Title: req.body.Movie })
        .then((mov) => {
            if (!mov) {
                return res.status(400).json({ Message: req.body.Movie + ' was not found' });
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
                        if(updatedUser) {
                            return res.status(200).json({ Username: updatedUser.Username, myMovies: updatedUser.myMovies });
                        } else {
                            return res.status(400).json({ Message: req.body.Movie + ' was not found in ' + req.params.Username + '\'s myMovies' });
                        }
                    }).catch(err => err500(err));
            }
        }).catch(err => err500(err));
});


module.exports = router;