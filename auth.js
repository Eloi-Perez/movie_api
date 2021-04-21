const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport.js');

let generateJWTToken = (user) => {
    return jwt.sign(user, process.env.JWT_KEY, {
        subject: user.Username, // Username to encode in the JWToken
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}

/* POST login. */
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    // user: user,
                    error: info
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                let Username = user.Username;
                return res.json({ Username, token });
            });
        })(req, res);
    });
}