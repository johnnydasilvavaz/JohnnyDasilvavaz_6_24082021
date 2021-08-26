const Sauce = require('../models/sauceModel');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(400).json({error}));
}

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({error}));
}

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({message: 'Sauce enregistrée !'}))
        .catch((error) => res.status(400).json({error}));
}

exports.modifySauce = (req, res, next) => {
    let sauceObject; 
    if (req.file) {
        Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, (error => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Image supprimée !");
                }
            })) 
        })
        .catch();
        sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        };
    } else {
        sauceObject = {...req.body};
    }
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({message: 'Sauce modifiée !'}))
        .catch((error) => res.status(400).json({error}));
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Objet supprimé !'}))
                    .catch((error) => res.status(400).json({error}));
            })
        })
        .catch((error) => res.status(500).json({error}));
}

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            switch(req.body.like) {
                case 1:
                    if (!sauce.usersLiked.find(id => id == req.body.userId)) {
                        sauce.likes ++;
                        sauce.usersLiked.push(req.body.userId);
                        Sauce.updateOne({_id: req.params.id}, sauce)
                            .then(() => res.status(201).json({message: 'Likes mis à jour !'}))
                            .catch((error) => res.status(400).json({error}));
                    }
                    break;
                case -1:
                    if (!sauce.usersDisliked.includes(req.body.userId)) {
                        sauce.dislikes ++;
                        sauce.usersDisliked.push(req.body.userId);
                        Sauce.updateOne({_id: req.params.id}, sauce)
                            .then(() => res.status(201).json({message: 'Dislikes mis à jour !'}))
                            .catch((error) => res.status(400).json({error}));
                    }
                    break;
                case 0:
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        sauce.likes --;
                        sauce.usersLiked.splice(sauce.usersLiked.find(id => id == req.body.userId));
                        Sauce.updateOne({_id: req.params.id}, sauce)
                            .then(() => res.status(201).json({message: 'Likes mis à jour !'}))
                            .catch((error) => res.status(400).json({error}));
                    }
                    if (sauce.usersDisliked.includes(req.body.userId)) {
                        sauce.dislikes --;
                        sauce.usersDisliked.splice(sauce.usersDisliked.find(id => id == req.body.userId));
                        Sauce.updateOne({_id: req.params.id}, sauce)
                            .then(() => res.status(201).json({message: 'Dislikes mis à jour !'}))
                            .catch((error) => res.status(400).json({error}));
                    }
                    break;
                default:
                    console.log('Aucun cas ne correspond');
            }
        })
        .catch((error) => res.status(404).json({error}));
}