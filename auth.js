const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport.js');

let generateJWTToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_KEY, {
        subject: payload.Username, // Username to encode in the JWToken
        expiresIn: '14d',
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
                let payload = {}
                payload._id = user._id;
                payload.Username = user.Username;
                // let token = generateJWTToken(user.toJSON()); // this generate token with full user info
                let token = generateJWTToken(payload);
                let Username = user.Username;
                return res.json({ Username, token });
            });
        })(req, res);
    });
}