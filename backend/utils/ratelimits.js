const rateLimiter = require('express-rate-limit');

const signupLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Trop de comptes créés depuis cette adresse IP, merci de réessayer dans une heure.'
});

const loginLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Vous êtes limité à 20 connexions toutes les 15min, par adresse IP."
});

const apiLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "L'accès à l'api est limité à 100 requètes toutes les 15min, par adresse IP."
});

module.exports = {
    signupLimiter,
    loginLimiter,
    apiLimiter
}