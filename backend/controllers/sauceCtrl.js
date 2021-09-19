const Sauce = require('../models/sauceModel');
const fs = require('fs');
const validator = require('validator');

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
    for (element in sauceObject) {
        //test if a field is empty
        if (!sauceObject[element]) {
            //remove the image
            fs.unlink(`images/${req.file.filename}`, (error => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Image removed !");
                }
            }))
            //return a message that indicate the empty field
            return res.status(400).json({message: "Field " + element + " is empty !"})
        }
        //test if fields contain other characters that are alphanumeric or space and -
        if (!validator.isAlphanumeric(validator.blacklist(sauceObject[element].toString(), ' -'))) {
            fs.unlink(`images/${req.file.filename}`, (error => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Image removed !");
                }
            }))
            //return a message that indicate the field that contain the wrong character
            return res.status(400).json({message: "Characters unauthorized in " + element + " field !"})
        }
    }
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({message: 'Sauce saved !'}))
        .catch((error) => {
            //if save is not working => delete the image
            fs.unlink(`images/${req.file.filename}`, (error => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Image removed !");
                }
            }))
            res.status(400).json({error})
        });
}

exports.modifySauce = (req, res, next) => {
    if (req.params.userId != req.params.id) {
        return res.status(403).json({message: '403: unauthorized request'});
    }
    let sauceObject;
    sauceObject = req.body;
    if (req.file) {
        sauceObject = JSON.parse(req.body.sauce);
    }
    for (element in sauceObject) {
        //test if a field is empty
        if (!sauceObject[element] && element != "imageUrl") {
            if (req.file) {
                fs.unlink(`images/${req.file.filename}`, (error => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Image removed !");
                    }
                }))
            }
            //return a message that indicate the empty field
            return res.status(400).json({message: "Field " + element + " is empty !"})
        }
        //test if fields contain other characters that are alphanumeric or space and -
        if (!validator.isAlphanumeric(validator.blacklist(sauceObject[element].toString(), ' -')) && element != "imageUrl") {
            if (req.file) {
                fs.unlink(`images/${req.file.filename}`, (error => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Image removed !");
                    }
                }))
            }
            //return a message that indicate the field that contain the wrong character
            return res.status(400).json({message: "Characters unauthorized in " + element + " field !"})
        }
    }
    //if there is a file in the request
    if (req.file) {
        Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, (error => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Image removed !");
                }
            })) 
        })
        .catch();
        sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        };
        console.log(sauceObject);
    } else {
        sauceObject = {...req.body};
        console.log(sauceObject);
    }
    
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({message: 'Sauce modified !'}))
        .catch((error) => res.status(400).json({error}));
}

exports.deleteSauce = (req, res, next) => {
    if (req.params.userId != req.params.id) {
        return res.status(403).json({message: '403: unauthorized request'});
    }
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce removed !'}))
                    .catch((error) => res.status(400).json({error}));
            })
        })
        .catch((error) => res.status(500).json({error}));
}

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            switch(req.body.like) {
                case 1: //like
                    if (!sauce.usersLiked.includes(req.body.userId)) {
                        sauce.likes ++;
                        sauce.usersLiked.push(req.body.userId);
                        Sauce.updateOne({_id: req.params.id}, sauce)
                            .then(() => res.status(201).json({message: 'Likes updated !'}))
                            .catch((error) => res.status(400).json({error}));
                    }
                    if (sauce.usersDisliked.includes(req.body.userId)) {
                        sauce.dislikes --;
                        sauce.usersDisliked.splice(sauce.usersDisliked.find(id => id == req.body.userId));
                        Sauce.updateOne({_id: req.params.id}, sauce)
                            .then(() => res.status(201).json({message: 'Dislikes updated !'}))
                            .catch((error) => res.status(400).json({error}));
                    }
                    break;
                case -1: //dislike
                    if (!sauce.usersDisliked.includes(req.body.userId)) {
                        sauce.dislikes ++;
                        sauce.usersDisliked.push(req.body.userId);
                        Sauce.updateOne({_id: req.params.id}, sauce)
                            .then(() => res.status(201).json({message: 'Dislikes updated !'}))
                            .catch((error) => res.status(400).json({error}));
                    }
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        sauce.likes --;
                        sauce.usersLiked.splice(sauce.usersLiked.find(id => id == req.body.userId));
                        Sauce.updateOne({_id: req.params.id}, sauce)
                            .then(() => res.status(201).json({message: 'Likes updated !'}))
                            .catch((error) => res.status(400).json({error}));
                    }
                    break;
                case 0: //disable like or dislike
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        sauce.likes --;
                        sauce.usersLiked.splice(sauce.usersLiked.find(id => id == req.body.userId));
                        Sauce.updateOne({_id: req.params.id}, sauce)
                            .then(() => res.status(201).json({message: 'Likes updated !'}))
                            .catch((error) => res.status(400).json({error}));
                    }
                    if (sauce.usersDisliked.includes(req.body.userId)) {
                        sauce.dislikes --;
                        sauce.usersDisliked.splice(sauce.usersDisliked.find(id => id == req.body.userId));
                        Sauce.updateOne({_id: req.params.id}, sauce)
                            .then(() => res.status(201).json({message: 'Dislikes updated !'}))
                            .catch((error) => res.status(400).json({error}));
                    }
                    break;
                default:
                    console.log('No case found !');
            }
        })
        .catch((error) => res.status(404).json({error}));
}