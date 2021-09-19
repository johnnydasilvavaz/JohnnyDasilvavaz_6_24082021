require('dotenv').config();
const cryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const validator = require('validator');

exports.signup = (req, res, next) => {
    if (!req.body.password) {
        return res.status(400).json({message: "Your password is empty !"})
    }
    if (!req.body.email) {
        return res.status(400).json({message: "Your email address is empty !"})
    }
    if (!validator.isStrongPassword(req.body.password)) {
        return res.status(400).json({message: "The password strengh is too low !"})
    }
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({message: "The email address format is incorrect !"})
    }
    const hash = cryptoJS.SHA256(req.body.password);
    const user = new User({
        email: req.body.email,
        password: hash
    });
    user.save()
        .then(() => res.status(201).json({message: 'User created !'}))
        .catch((error) => res.status(400).json({error}));
}

exports.login = (req, res, next) => {
    if (!req.body.password) {
        return res.status(400).json({message: "Your password is empty !"})
    }
    if (!req.body.email) {
        return res.status(400).json({message: "Your email address is empty !"})
    }
    if (!validator.isStrongPassword(req.body.password)) {
        return res.status(400).json({message: "The password strengh is too low !"})
    }
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({message: "The email address format is incorrect !"})
    }
    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                return res.status(401).json({error: 'User not find !'});
            }
            if (cryptoJS.SHA256(req.body.password) == user.password) {
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        {userId: user.id},
                        process.env.TOKEN_SECRET,
                        {expiresIn: '24h'}
                    )
                });
            } else {
                return res.status(401).json({error: 'Wrong password !'});
            }
        })
        .catch((error) => res.status(500).json({error}));
}