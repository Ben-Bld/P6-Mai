const mongoose = require("mongoose"); // Import du module mongoose pour la gestion des bases de données MongoDB
const uniqueValidator = require('mongoose-unique-validator'); // Import du plugin mongoose-unique-validator pour la validation des champs uniques

// Définition du schéma de données pour les utilisateurs
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Champ email requis et unique pour chaque utilisateur
  password: { type: String, required: true }, // Champ mot de passe requis pour chaque utilisateur
});

userSchema.plugin(uniqueValidator); // Utilisation du plugin mongoose-unique-validator pour valider l'unicité de l'email

module.exports = mongoose.model("User", userSchema); // Export du modèle User basé sur le schéma défini
