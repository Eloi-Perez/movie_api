const express = require('express'),
morgan = require('morgan');
const app = express();

// app.get('/', function (req, res, next) {
//     next();
// })

let top10 = [
    {
        'title': 'Primer'
    },
    {
        'title': 'Donnie Darko'
    },
    {
        'title': 'Avengers: Endgame'
    },
    {
        'title': 'The Butterfly Effect'
    },
    {
        'title': 'Happy Death Day'
    },
    {
        'title': 'Interstellar'
    },
    {
        'title': 'The Terminator'
    },
    {
        'title': 'Back to the Future'
    },
    {
        'title': 'About Time'
    },
    {
        'title': '12 Monkeys'
    }
];

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

app.get('/movies', (req, res) => {
    res.json(top10);
});

app.get('/movies/:title', (req, res) => {
    res.send('Successful get data title');
});

app.get('/movies/:genre', (req, res) => {
    res.send('Successful get list films genre');
});

app.get('/movies/:director', (req, res) => {
    res.send('Successful get data director');
});

app.post('/users', (req, res) => {
    res.send('Successful create new user');
}); 

app.put('/users/:user', (req, res) => {
    res.send('Successful update user');
}); 

app.post('/users/:user/favorites', (req, res) => {
    res.send('Successful add new favorite film');
}); 

app.delete('/users/:user/favorites/:title', (req, res) => {
    res.send('Successful delete favorite film');
}); 

app.delete('/users/:user', (req, res) => {
    res.send('Successful delete user');
}); 

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });

// Logging
// User authentication
// App routing