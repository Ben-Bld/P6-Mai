const Sauce = require("../models/Sauce"); //import de Sauce dans les models
const fs = require("fs"); // import du module fs pour intéragir avec le système de fichier du serveur

// Fonction pour créer une nouvelle sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); // Conversion de la chaîne JSON en objet JavaScript
  delete sauceObject._id; // Suppression de l'identifiant de la sauce
  delete sauceObject._userId; // Suppression de l'identifiant de l'utilisateur
  const sauce = new Sauce({
    ...sauceObject, // Utilisation de l'opérateur de décomposition pour copier les propriétés de l'objet sauceObject
    userId: req.auth.userId, // Attribution de l'identifiant de l'utilisateur actuel à la nouvelle sauce
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`, // Construction de l'URL de l'image de la sauce
  });

  sauce
    .save() // Sauvegarde de la nouvelle sauce dans la base de données MongoDB
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" }); // Réponse en cas de succès
    })
    .catch((error) => {
      res.status(400).json({ error }); // Réponse en cas d'erreur
    });
};

// Fonction pour modifier une sauce existante
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file // Vérification de la présence d'un fichier
    ? {
        ...JSON.parse(req.body.sauce), // Conversion de la chaîne JSON en objet JavaScript
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`, // Construction de l'URL de la nouvelle image de la sauce
      }
    : { ...req.body }; // Sinon, récupération de l'objet dans le corps de la requête

  delete sauceObject._userId; // Suppression de l'identifiant de l'utilisateur de la requête pour éviter toute tentative de modification par un utilisateur non autorisé

  Sauce.findOne({ _id: req.params.id }) // Recherche de la sauce à modifier dans la base de données
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        // Vérification que l'utilisateur actuel est bien le propriétaire de la sauce
        res.status(401).json({ message: "Not authorized" }); // Réponse en cas de non autorisation
      } else {
        // Mise à jour de l'enregistrement de la sauce dans la base de données
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id } // Utilisation de l'opérateur de décomposition pour mettre à jour les propriétés de la sauce
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" })) // Réponse en cas de succès
          .catch((error) => res.status(401).json({ error })); // Réponse en cas d'erreur
      }
    })
    .catch((error) => {
      res.status(400).json({ error }); // Réponse en cas d'erreur
    });
};

// Fonction pour supprimer une sauce
exports.deleteSauce = async (req, res, next) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id }); // Recherche de la sauce à supprimer dans la base de données

    if (!sauce) {
      // Vérification de l'existence de la sauce
      return res.status(404).json({ error: "La sauce n'existe pas" }); // Réponse en cas de non existence
    }

    const filename = sauce.imageUrl.split("/images/")[1]; // Extraction du nom de fichier de l'image à partir de son URL

    fs.unlink(`images/${filename}`, (err) => {
      // Suppression de l'image du serveur de fichiers
      if (err) {
        // Gestion des erreurs liées à la suppression de l'image
        return res
          .status(500)
          .json({ error: "Erreur lors de la suppression de l'image" }); // Réponse en cas d'erreur
      }

      // Suppression de la sauce de la base de données
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => {
          res.status(200).json({ message: "Sauce supprimée" }); // Réponse en cas de succès
        })
        .catch((error) => {
          res
            .status(500)
            .json({
              error:
                "Erreur lors de la suppression de la sauce de la base de données",
            }); // Réponse en cas d'erreur
        });
    });
  } catch (error) {
    res.status(500).json({ error: error.message }); // Gestion des erreurs générales
  }
};

// Fonction pour récupérer une sauce spécifique
exports.getOneSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id }) // Recherche de la sauce spécifique dans la base de données
    .then((sauce) => res.status(200).json(sauce)) // Réponse avec la sauce trouvée
    .catch((error) => res.status(404).json({ error })); // Réponse en cas d'erreur
};

// Fonction pour récupérer toutes les sauces
exports.getAllSauces = (req, res) => {
  Sauce.find() // Recherche de toutes les sauces dans la base de données
    .then((sauces) => res.status(200).json(sauces)) // Réponse avec la liste de toutes les sauces trouvées
    .catch((error) => res.status(400).json({ error })); // Réponse en cas d'erreur
};

// Fonction pour liker ou disliker une sauce
exports.likeSauce = async function (req, res, next) {
  try {
    const likedSauce = await Sauce.findOne({ _id: req.params.id }); // Recherche de la sauce à liker ou disliker

    switch (
      req.body.like // Traitement du type d'action de like ou dislike
    ) {
      case 1:
        if (!likedSauce.usersLiked.includes(req.body.userId)) {
          // Vérification si l'utilisateur n'a pas déjà liké la sauce
          await Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } } // Incrémentation du nombre de likes et ajout de l'utilisateur dans la liste des likers
          );
          return res.status(201).json({ message: "sauce likée" }); // Réponse en cas de succès
        }
        break;
      case -1:
        if (!likedSauce.usersDisliked.includes(req.body.userId)) {
          // Vérification si l'utilisateur n'a pas déjà disliké la sauce
          await Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } } // Incrémentation du nombre de dislikes et ajout de l'utilisateur dans la liste des dislikers
          );
          return res.status(201).json({ message: "sauce dislikée" }); // Réponse en cas de succès
        }
        break;
      case 0:
        if (likedSauce.usersLiked.includes(req.body.userId)) {
          // Vérification si l'utilisateur a déjà liké la sauce
          await Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } } // Décrémentation du nombre de likes et suppression de l'utilisateur de la liste des likers
          );
          return res.status(201).json({ message: "like annulé !" }); // Réponse en cas de succès
        }
        if (likedSauce.usersDisliked.includes(req.body.userId)) {
          // Vérification si l'utilisateur a déjà disliké la sauce
          await Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId },
            } // Décrémentation du nombre de dislikes et suppression de l'utilisateur de la liste des dislikers
          );
          return res.status(201).json({ message: "dislike annulé !" }); // Réponse en cas de succès
        }
        break;
      default:
        return res.status(400).json({ error: "like invalid " }); // Réponse en cas de like invalide
    }
  } catch (error) {
    return res.status(404).json({ error: error.message }); // Gestion des erreurs
  }
};
