const express = require("express");
const bcrypt = require('bcryptjs');

const db = require('../data/database')

const router = express.Router();

router.get('/',function(req, res){
    res.render('home');
})

router.get('/signup', function (req, res) {
    res.render('signup');
})

router.post('/signup', async function(req, res){
    const userData = req.body;
    const enteredPassword = userData.password
    const enteredEmail = userData.email;
    const enteredConfirmEmail = userData['confirm-email'];
    

    const hashedPassword = await bcrypt.hash(enteredPassword, 12)

    const user = {
        email: enteredEmail,
        password: hashedPassword
    }


    await db.getDb().collection('users').insertOne(user);
    res. redirect('/admin')
})

router.get('/login', function (req, res){
    res.render('login');
});

router.get('/admin', function (req, res){
    res.render('admin');
});

router.get('/dummy-link', function(req, res){
    res.render()
})


module.exports = router