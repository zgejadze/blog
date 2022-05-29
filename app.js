const path = require('path')
const express = require('express') 
const db = require('./data/database')


const blogRoutes = require('./routes/demo')
const database = require('./data/database')

const app = express()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }));



const port = 3000

app.use(blogRoutes)

db.connectToDatabase().then(function () {
    app.listen(3000)
})