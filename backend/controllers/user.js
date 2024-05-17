const bcrypt = require("bcrypt"); // Import du module bcrypt pour le hashage des mots de passe
const User = require("../models/User"); // Import du modèle User
const jwt = require("jsonwebtoken"); // Import du module jsonwebtoken pour la gestion des tokens JWT

// Fonction pour l'inscription d'un utilisateur
exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10) // Hashage du mot de passe avec un coût de 10
    .then((hash) => {
      const user = new User({ // Création d'un nouvel utilisateur avec l'email et le mot de passe hashé
        email: req.body.email,
        password: hash,
      });
      user
        .save() // Sauvegarde de l'utilisateur dans la base de données
        .then(() => res.status(201).json({ message: "utilisateur créé" })) // Réponse en cas de succès
        .catch((error) => res.status(400).json({ error })); // Réponse en cas d'erreur
    })
    .catch((error) => res.status(500).json({ error })); // Gestion des erreurs
};

// Fonction pour la connexion d'un utilisateur
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email }) // Recherche de l'utilisateur dans la base de données par email
    .then((user) => {
      if (user === null) { // Vérification si l'utilisateur existe
        res.status(401).json({ message: "Paire identifiant/mdp incorrect" }); // Réponse en cas d'identifiant/mot de passe incorrect
      } else {
        bcrypt
          .compare(req.body.password, user.password) // Comparaison du mot de passe fourni avec celui stocké dans la base de données
          .then((valid) => {
            if (!valid) { // Vérification si les mots de passe correspondent
              res
                .status(401)
                .json({ message: "Paire identifiant/mdp incorrect" }); // Réponse en cas d'identifiant/mot de passe incorrect
            } else {
              // Génération d'un token JWT avec l'identifiant de l'utilisateur et une clé secrète
              res.status(200).json({
                userId: user._id, // Envoi de l'identifiant de l'utilisateur
                token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", { // Envoi du token JWT
                  expiresIn: "2400h", // Définition de la durée de validité du token
                }),
              });
            }
          })
          .catch((error) => {
            res.status(500).json({ error }); // Gestion des erreurs
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ error }); // Gestion des erreurs
    });
};
