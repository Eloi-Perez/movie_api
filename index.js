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

app.get('/movies', (req, res) => {
    res.json(top10);
});

app.get('/', (req, res) => {
    res.send('Welcome to the Time Travel Films API');
});

app.get('/documentation.html', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname })
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });

// Logging
// User authentication
// App routing