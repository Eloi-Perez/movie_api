const express = require("express"),
    jwt = require("jsonwebtoken"),
    passport = require("passport"),
    mongoose = require("mongoose");

const { check, validationResult } = require("express-validator");

const router = express.Router();
require("../passport.js");

const Models = require("../models.js");
const Movies = Models.Movie;
const Users = Models.User;

//My Functions
///Error 500
const err500 = (err) => {
    console.error(err);
    res.status(500).json({ error: err });
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
// const myVar = {};
// !!Object.keys(myVar).length; //!! -> true or false

///Compare Passport User and URL :User
function checkUser(req, res, next) {
    if (req.user.Username === req.params.Username) {
        next();
    } else {
        return res.status(401).json({ error: "Unauthorized" });
    }
}

//Generate JWT
const generateJWTToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_KEY, {
        subject: payload.Username, // Username to encode in the JWToken
        expiresIn: "14d",
        algorithm: "HS256",
    });
};

/**
 * @swagger
 * /users:
 *   post:
 *       summary: Creates a new user.
 *       requestBody:
 *           content:
 *               'application/json':
 *                   schema:
 *                       $ref: '#/components/schemas/CreateUser'
 *       responses:
 *           201:
 *               description: Created
 *               content:
 *                   application/json:
 *                       schema:
 *                           type: object
 *                           properties:
 *                              Message:
 *                                  example: Created Successfully
 *                              Username:
 *                                  example: Joe
 *                              token:
 *                                  example: JWT
 */
router.post(
    "/users",
    [
        // Validation logic for request
        check("Username", "Username is required").isLength({ min: 3 }),
        check(
            "Username",
            "Username contains non alphanumeric characters - not allowed."
        ).isAlphanumeric(),
        check("Password", "Password is required").not().isEmpty(),
        check("Email", "Email does not appear to be valid")
            .normalizeEmail()
            .isEmail(),
    ],
    (req, res) => {
        // check the validation object for errors
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOne({ Username: req.body.Username })
            .then((user) => {
                if (user) {
                    return res.status(400).json({
                        Message: "Username: " + req.body.Username + " already exist",
                    });
                } else {
                    Users.create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        BirthDate: req.body.BirthDate,
                    })
                        .then((user) => {
                            //generate JWT here
                            req.login(user, { session: false }, (err) => {
                                if (err) {
                                    res.json({ Error: err });
                                }
                                let payload = {};
                                payload._id = user._id;
                                payload.Username = user.Username;
                                let token = generateJWTToken(payload);
                                return res.status(201).json({
                                    Message: "Created Successfully",
                                    Username: user.Username,
                                    token,
                                });
                            });
                        })
                        .catch((err) => {
                            console.error(err);
                            res.status(400).json({ Error: err });
                        });
                }
            })
            .catch((err) => {
                err500(err);
            });
    }
);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: login User.
 *     requestBody:
 *       content:
 *         'application/json':
 *           schema:
 *              $ref: "#/components/schemas/User"
 *     responses:
 *       201:
 *         description: Login Successful
 *         content:
 *           application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      Username:
 *                          example: Joe
 *                      token:
 *                          example: JWT
 */
router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
        if (error || !user) {
            return res.status(400).json({
                Message: "Something is not right",
                // user: user,
                Error: info,
            });
        }
        req.login(user, { session: false }, (error) => {
            if (error) {
                res.json({ Error: error });
            }
            let payload = {};
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

/**
* @swagger
* /users/{Username}:
*   get:
*       summary: Get a user by username + myMovies list in User.
*       description: Retrieve user {Username}.
*       parameters:
*       - in: path
*         name: Username
*         required: true
*         description: 'User name'
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
*                           $ref: '#/components/schemas/UserMyMovies'
*/
router.get(
    "/users/:Username",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Users.findOne({ Username: req.params.Username })
            .populate({ path: "myMovies.Movie", select: ["Title", "ImagePath"] })
            .then((user) => {
                if (user) {
                    res
                        .status(200)
                        .json({ Username: user.Username, myMovies: user.myMovies });
                } else {
                    res.status(400).json({
                        Message: "Username: " + req.params.Username + " was not found",
                    });
                }
            })
            .catch((err) => {
                err500(err);
            });
    }
);

/**
* @swagger
* /users:
*   patch:
*       summary: Update a user's info, by username.
*       description: Update user.
*       requestBody:
*           content:
*               'application/json':
*                   schema:
*                       $ref: "#/components/schemas/UpdateUser"
*       responses:
*           200:
*               description: JSON object.
*               content:
*                   application/json:
*                       schema:
*                           type: object
*                           properties:
*                               Message: 
*                                   example: Updated Successfully
*                               Username:
*                                   example:  Joe
*                               
*/
router.put(
    "/users",
    passport.authenticate("local", { session: false }),
    [
        check("NewUsername", "Username is required")
            .optional()
            .isLength({ min: 3 }),
        check(
            "NewUsername",
            "Username contains non alphanumeric characters - not allowed."
        )
            .optional()
            .isAlphanumeric(),
        check("NewPassword", "Password is required").optional().not().isEmpty(),
        check("NewEmail", "Email does not appear to be valid")
            .optional()
            .normalizeEmail()
            .isEmail(),
    ],
    (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword;
        if (req.body.NewPassword) {
            hashedPassword = Users.hashPassword(req.body.NewPassword);
        }
        Users.findOneAndUpdate(
            { Username: req.body.Username },
            {
                $set: {
                    Username: req.body.NewUsername,
                    Password: hashedPassword,
                    Email: req.body.NewEmail,
                    BirthDate: req.body.BirthDate,
                },
            },
            { new: true, omitUndefined: true },
            (err, updatedUser) => {
                if (err) {
                    err500(err);
                } else {
                    if (updatedUser) {
                        res.status(200).json({
                            Message: "Updated Successfully",
                            Username: updatedUser.Username,
                        });
                    } else {
                        res
                            .status(400)
                            .json({ Message: req.params.Username + " was not found" });
                    }
                }
            }
        );
    }
);

/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Delete a user by username.
 *     requestBody:
 *       content:
 *         'application/json':
 *           schema:
 *              $ref: "#/components/schemas/User"
 *     responses:
 *       200:
 *         description: Delete Successful
 *         content:
 *           application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      Message:
 *                          example: Deleted successfully
 */
router.delete(
    "/users",
    passport.authenticate("local", { session: false }),
    (req, res) => {
        Users.findOneAndRemove({ Username: req.body.Username })
            .then((user) => {
                if (!user) {
                    res
                        .status(400)
                        .json({ Message: req.body.Username + " was not found" }); //not in use because auth
                } else {
                    res
                        .status(200)
                        .json({ Message: req.body.Username + " was deleted." });
                }
            })
            .catch((err) => {
                err500(err);
            });
    }
);

/**
* @swagger
* /users/{Username}/myMovies:
*   patch:
*       summary: Update or Add a movie to users's myMovies
*       description: Update user myMovies.
*       parameters:
*       - in: path
*         name: Username
*         required: true
*         description: 'User name'
*         schema:
*             type: string
*       security:
*           - bearerAuth: []
*       requestBody:
*           content:
*               'application/json':
*                   schema:
*                       $ref: "#/components/schemas/myMovies"
*       responses:
*           200:
*               description: JSON object.
*               content:
*                   application/json:
*                       schema:
*                           $ref: '#/components/schemas/UserMyMovies'
*/
router.put(
    "/users/:Username/myMovies",
    passport.authenticate("jwt", { session: false }),
    checkUser,
    [
        //.post
        check(
            "Score",
            "Score must be an integer number between 0 and 10 or an empty string"
        )
            .optional()
            .custom(
                (value) =>
                    (Number.isInteger(value) && value >= 0 && value <= 10) ||
                    value === null
            ), //.optional().isInt({ min: 0, max: 10 }.custom((value, { req })
        check(
            "RelevanceTT",
            "RelevanceTT must be an integer number between 0 and 10 or an empty string"
        )
            .optional()
            .custom(
                (value) =>
                    (Number.isInteger(value) && value >= 0 && value <= 10) ||
                    value === null
            ), //should be null instead of "" ????
    ],
    (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        Movies.findOne({ Title: req.body.Movie })
            .then((mov) => {
                if (!mov) {
                    return res
                        .status(400)
                        .json({ Message: req.body.Movie + " was not found" });
                } else if (mov) {
                    Users.find({
                        Username: req.params.Username,
                        "myMovies.Movie": mongoose.Types.ObjectId(mov._id),
                    })
                        .then((movInUser) => {
                            if (!isEmpty(movInUser)) {
                                //Update if already in myMovies
                                Users.findOneAndUpdate(
                                    {
                                        Username: req.user.Username,
                                        "myMovies.Movie": mongoose.Types.ObjectId(mov._id),
                                    },
                                    {
                                        $set: {
                                            "myMovies.$[elem].Score": req.body.Score,
                                            "myMovies.$[elem].RelevanceTT": req.body.RelevanceTT,
                                            "myMovies.$[elem].PlanToWatch": req.body.PlanToWatch,
                                            "myMovies.$[elem].Favorite": req.body.Favorite,
                                        },
                                    },
                                    {
                                        arrayFilters: [
                                            { "elem.Movie": mongoose.Types.ObjectId(mov._id) },
                                        ],
                                        validateModifiedOnly: true,
                                        omitUndefined: true,
                                        new: true,
                                    }
                                )
                                    .populate({
                                        path: "myMovies.Movie",
                                        select: ["Title", "ImagePath"],
                                    })
                                    .then((updatedUser) => {
                                        if (updatedUser) {
                                            return res.status(200).json({
                                                Username: updatedUser.Username,
                                                myMovies: updatedUser.myMovies,
                                            });
                                        } else {
                                            return res.status(400).json({
                                                Message:
                                                    req.body.Movie +
                                                    " was not found in " +
                                                    req.params.Username +
                                                    "'s myMovies",
                                            });
                                        }
                                    })
                                    .catch((err) => err500(err));

                                //not needed -> return res.status(400).json({ Message: req.body.Movie + ' already exist in ' + req.params.Username + '\'s myMovies' });
                            } else if (isEmpty(movInUser)) {
                                //Push if not in myMovies
                                Users.findOneAndUpdate(
                                    { Username: req.user.Username },
                                    {
                                        //Using User from Token
                                        $push: {
                                            myMovies: [
                                                {
                                                    Movie: mongoose.Types.ObjectId(mov._id),
                                                    Score: req.body.Score,
                                                    RelevanceTT: req.body.RelevanceTT,
                                                    PlanToWatch: req.body.PlanToWatch,
                                                    Favorite: req.body.Favorite,
                                                },
                                            ],
                                        },
                                    },
                                    { validateModifiedOnly: true, new: true }
                                )
                                    .populate({
                                        path: "myMovies.Movie",
                                        select: ["Title", "ImagePath"],
                                    })
                                    .then((updatedUser) => {
                                        return res.status(201).json({
                                            Username: updatedUser.Username,
                                            myMovies: updatedUser.myMovies,
                                        });
                                    })
                                    .catch((err) => err500(err));
                            }
                        })
                        .catch((err) => err500(err));
                }
            })
            .catch((err) => err500(err));
    }
);

module.exports = router;