const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' },// genres ref to model here not db
    Director: { type: mongoose.Schema.Types.ObjectId, ref: 'Director' },
    ImagePath: String,
    Featured: Boolean
});

let genreSchema = mongoose.Schema({
    Name: String,
    Description: String
})

let directorSchema = mongoose.Schema({
    Name: String,
    Bio: String,
    BirthDate: Date,
    DeathDate: Date
})

let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: [true, 'Email needed'] },
    BirthDate: { type: Date, default: '' },
    myMovies: [{
        Movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
        Score: { type: Number, default: '' },//min: 0, max, 10,
        RelevanceTT: { type: Number, default: '' },
        PlanToWatch: { type: Boolean, default: false },
        Favorite: { type: Boolean, default: false }
    }]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let Genre = mongoose.model('Genre', genreSchema);
let Director = mongoose.model('Director', directorSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.Genre = Genre;
module.exports.Director = Director;
module.exports.User = User;