const mongoose = require('mongoose'); // Import du module mongoose pour la gestion des bases de données MongoDB

// Définition du schéma de données pour les sauces
const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true }, // Identifiant de l'utilisateur ayant créé la sauce
  name: { type: String, required: true }, // Nom de la sauce
  manufacturer: { type: String, required: true }, // Fabricant de la sauce
  description: { type: String, required: true }, // Description de la sauce
  mainPepper: { type: String, required: true }, // Principal ingrédient de la sauce
  imageUrl: { type: String, required: true }, // URL de l'image de la sauce
  heat: { type: Number, required: true }, // Niveau de piquant de la sauce
  likes: { type: Number, default: 0 }, // Nombre de likes de la sauce (par défaut à 0)
  dislikes: { type: Number, default: 0 }, // Nombre de dislikes de la sauce (par défaut à 0)
  usersLiked: { type: [String], default: [] }, // Liste des utilisateurs ayant liké la sauce (par défaut vide)
  usersDisliked: { type: [String], default: [] }, // Liste des utilisateurs ayant disliké la sauce (par défaut vide)
});

module.exports = mongoose.model('Sauce', sauceSchema); // Export du modèle Sauce basé sur le schéma défini
