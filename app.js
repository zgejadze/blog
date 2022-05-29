const express = require('express') 
const path = require('path')

const blogRoutes = require('./routes/demo')

const app = express()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.static('public'))


const port = 3000

app.use(blogRoutes)

app.listen(3000)