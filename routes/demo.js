const express = require("express");

const router = express.Router();

router.get('/',function(req, res){
    res.render('home');
})

router.get('/signup', function (req, res) {
    res.render('signup');
})

router.get('/login', function (req, res){
    res.render('login');
});

router.get('/admin', function (req, res){
    res.render('admin');
});

router.get('/dummy-link', function(req, res){
    res.render('single-post')
})


module.exports = router