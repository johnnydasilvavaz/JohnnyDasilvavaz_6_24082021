const cryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.signup = (req, res, next) => {
    const hash = cryptoJS.SHA256(req.body.password);
    const user = new User({
        email: req.body.email,
        password: hash
    });
    user.save()
        .then(() => res.status(201).json({message: 'utilisateur créé !'}))
        .catch((error) => res.status(400).json({error}));
}

exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                return res.status(401).json({error: 'utilisateur non trouvé !'});
            }
            if (cryptoJS.SHA256(req.body.password == User.password)) {
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        {userId: user.id},
                        'RANDOM_TOKEN_SECRET',
                        {expiresIn: '24h'}
                    )
                });
            } else {
                return res.status(401).json({error: 'Mot de passe incorrect !'});
            }
        })
        .catch((error) => res.status(500).json({error}));
}