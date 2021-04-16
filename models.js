const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
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
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    BirthDate: {type: Date, default: ''},
    myMovies: [{ //Move to another collection?????
        Movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
        // Movie: String,
        Score: { type: Number, default: ''},
        RelevanceTT: { type: Number, default: ''},
        PlanToWatch: { type: Boolean, default: false},
        Favorite: { type: Boolean, default: false}
    }]
});

let Movie = mongoose.model('Movie', movieSchema);
let Genre = mongoose.model('Genre', genreSchema);
let Director = mongoose.model('Director', directorSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.Genre = Genre;
module.exports.Director = Director;
module.exports.User = User;