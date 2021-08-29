'use strict';


/**
 * Get director info.
 * Retrive director {Director}.
 *
 * director String Name of the director.
 * returns inline_response_200_1
 **/
exports.directorsDirectorGET = function(director) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "Description" : "is an American filmmaker, screenwriter, composer, and actor...",
  "_id" : "60720485078f3662d0e67bfa",
  "Name" : "Shane Carruth"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get genre info.
 * Retrive genre {Genre}.
 *
 * genre String Name of the genre.
 * returns inline_response_200
 **/
exports.genresGenreGET = function(genre) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "Description" : "Focused on emotions and defined by conflict...",
  "_id" : "60720485078f3662d0e67bfa",
  "Name" : "Drama"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get Images by Title
 * Movies images.
 *
 * title List Title of the movie.
 * no response value expected for this operation
 **/
exports.imgTitleGET = function(title) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * login User.
 *
 * body User  (optional)
 * returns inline_response_201_1
 **/
exports.loginPOST = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "Username" : "Joe",
  "token" : "JWT"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get Featured Movies.
 * Retrive the featured list of movies and their properties
 *
 * returns Movies
 **/
exports.moviesFeaturedGET = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ "", "" ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get all Movies.
 * Retrive the full list of movies and their properties
 *
 * returns Movies
 **/
exports.moviesGET = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ "", "" ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get one Movie.
 * Retrive movie {Title}.
 *
 * title String Title of the movie.
 * returns Movie
 **/
exports.moviesTitleGET = function(title) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "Description" : "A man accidentally gets into a time machine and...",
  "Director" : { },
  "ImagePath" : "/img/timecrimes",
  "Title" : "Timecrimes",
  "Featured" : true,
  "_id" : "60720485078f3662d0e67bfa",
  "Genre" : { }
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Welcome root route.
 * HTML page.
 *
 * no response value expected for this operation
 **/
exports.rootGET = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Delete a user by username.
 *
 * body User  (optional)
 * returns inline_response_200_2
 **/
exports.usersDELETE = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "Message" : "Deleted successfully"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Update a user's info, by username.
 * Update user.
 *
 * body UpdateUser  (optional)
 * returns inline_response_200_3
 **/
exports.usersPATCH = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "Message" : "Updated Successfully",
  "Username" : "Joe"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Creates a new user.
 *
 * body CreateUser  (optional)
 * returns inline_response_201
 **/
exports.usersPOST = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "Message" : "Created Successfully",
  "Username" : "Joe",
  "token" : "JWT"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get a user by username + myMovies list in User.
 * Retrive user {Username}.
 *
 * username String User name
 * returns UserMyMovies
 **/
exports.usersUsernameGET = function(username) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "Username" : "Joe",
  "myMovies" : [ {
    "Favorite" : true,
    "Movie" : {
      "ImagePath" : "/img/timecrimes",
      "Title" : "Timecrimes",
      "_id" : "60720485078f3662d0e67bfa"
    },
    "score" : 7,
    "_id" : "60720485078f3662d0e67bfa",
    "RelevanceTT" : 9,
    "PlanToWatch" : false
  }, {
    "Favorite" : true,
    "Movie" : {
      "ImagePath" : "/img/timecrimes",
      "Title" : "Timecrimes",
      "_id" : "60720485078f3662d0e67bfa"
    },
    "score" : 7,
    "_id" : "60720485078f3662d0e67bfa",
    "RelevanceTT" : 9,
    "PlanToWatch" : false
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Update or Add a movie to users's myMovies
 * Update user myMovies.
 *
 * body MyMovies  (optional)
 * username String User name
 * returns UserMyMovies
 **/
exports.usersUsernameMyMoviesPATCH = function(body,username) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "Username" : "Joe",
  "myMovies" : [ {
    "Favorite" : true,
    "Movie" : {
      "ImagePath" : "/img/timecrimes",
      "Title" : "Timecrimes",
      "_id" : "60720485078f3662d0e67bfa"
    },
    "score" : 7,
    "_id" : "60720485078f3662d0e67bfa",
    "RelevanceTT" : 9,
    "PlanToWatch" : false
  }, {
    "Favorite" : true,
    "Movie" : {
      "ImagePath" : "/img/timecrimes",
      "Title" : "Timecrimes",
      "_id" : "60720485078f3662d0e67bfa"
    },
    "score" : 7,
    "_id" : "60720485078f3662d0e67bfa",
    "RelevanceTT" : 9,
    "PlanToWatch" : false
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

