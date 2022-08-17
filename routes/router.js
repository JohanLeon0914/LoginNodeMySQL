const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

//Rutas para las vistas
router.get('/products', authController.isAuthenticate, (req, res) =>{
    res.render('index', {user:req.user})
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
})

module.exports = router