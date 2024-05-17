const Sauce = require("../models/Sauce");
const fs= require("fs")  //donne des methodes pour intéragir avec le systeme de fichier du serveur

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
//empêche utilisateur malveillant de faire une requête en utilisant le user id d'un autre client

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        //on vérifie si un champs file est présent
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body }; //sinon, on récup l'objet dans le corps de la requête

  delete sauceObject._userId; //on supprime le userId de la requête pour éviter qu'un object soit créé à son nom, et reassigné à quelqu'un d'autre

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        // on vérifie que l'objet modifie appartient bien à l'utilisateur qui cherche à le modif
        res.status(401).json({ message: "Not authorized" });
      } else {
        //si c'est le bon user
        //on met à jour l'enregistrement
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteSauce = async (req, res, next) => {
  try {
    // Recherche de la sauce à supprimer dans la base de données
    const sauce = await Sauce.findOne({ _id: req.params.id });

    // Vérification de l'existence de la sauce
    if (!sauce) {
      return res.status(404).json({ error: "La sauce n'existe pas" });
    }

    // Extraction du nom de fichier de l'image à partir de son URL
    const filename = sauce.imageUrl.split('/images/')[1];

    // Suppression de l'image du serveur de fichiers
    fs.unlink(`images/${filename}`, (err) => {
      if (err) {
        // Gestion des erreurs liées à la suppression de l'image
        return res.status(500).json({ error: "Erreur lors de la suppression de l'image" });
      }
      
      // Suppression de la sauce de la base de données
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => {
          // Réponse indiquant que la sauce a été supprimée avec succès
          res.status(200).json({ message: 'Sauce supprimée' });
        })
        .catch(error => {
          // Gestion des erreurs liées à la suppression de la sauce de la base de données
          res.status(500).json({ error: "Erreur lors de la suppression de la sauce de la base de données" });
        });
    });
  } catch (error) {
    // Gestion des erreurs générales
    res.status(500).json({ error: error.message });
  }
};

exports.getOneSauce = (req, res) => {
  Sauce.findOne({_id: req.params.id})
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({error}))
};
exports.getAllSauces = (req, res) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};


exports.likeSauce = async function (req, res, next) {
  try {
    const likedSauce = await Sauce.findOne({ _id: req.params.id });

    switch (req.body.like) {
      case 1:
        if (!likedSauce.usersLiked.includes(req.body.userId)) {
          await Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } }
          );
          return res.status(201).json({ message: "sauce likée" });
        }
        break;
      case -1:
        if (!likedSauce.usersDisliked.includes(req.body.userId)) {
          await Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } }
          );
          return res.status(201).json({ message: "sauce dislikée" });
        }
        break;
      case 0:
        if (likedSauce.usersLiked.includes(req.body.userId)) {
          await Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
          );
          return res.status(201).json({ message: "like annulé !" });
        }
        if (likedSauce.usersDisliked.includes(req.body.userId)) {
          await Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
          );
          return res.status(201).json({ message: "dislike annulé !" });
        }
        break;
      default:
        return res.status(400).json({ error: "like invalid " });
    }
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};