const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const { promisify } = require('util') //usando promesas

//Metodo para registrarse

exports.register = async (req, res) => {

    try {
        const name = req.body.name
        const user = req.body.user
        const pass = req.body.pass
        let passHash = await bcryptjs.hash(pass, 8)

        const data = {
            name: name,
            user:user,
            pass: passHash
        }
        conexion.query('INSERT INTO users SET ?', data, (err, conn) =>{
            if(err) {console.log(err)}
            res.send('Usuario registrado')
        })

    } catch (error) {
        console.log(error);
    }
}

exports.login = async (req, res) => {
    try {
        const user = req.body.user
        const pass = req.body.pass
        if(!user || !pass){ 
            res.send('No hay contraseña o usuario')
        } else {
            conexion.query('SELECT * FROM users WHERE user = ?', [user], async (err, conn) =>{
                if(conn.length == 0 || !(await bcryptjs.compare(pass, conn[0].pass))) {
                    res.send('Usuario no identificado')
                } else {
                    const id = conn[0].id
                    const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    })
                    console.log(token + "para el usuario: " + user);
                    const cookieOptions = {
                        expiresIn: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    }
                    res.cookie('jwt', token, cookieOptions)
                    res.send('logeado')
                }
            })
        }
    } catch (error) {
        console.log(error);
    }
}

exports.isAuthenticate = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            conexion.query('SELECT FROM users WHERE id = ?', [decodificada.id], (error, results) =>{
                if(!results) {return next()}
                req.user = results[0]
                return next
            })
        } catch (error) {
            console.log(error);
            return next()
        }
    } else {
        res.send('No autentificado')
        next()
    }
}

exports.logout = async (req, res) => {
    res.clearCookie('jwt')
    res.send('logout')
    return res.redirect('/')
}