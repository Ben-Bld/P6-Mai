const express = require('express'); // Import du framework Express pour créer des routes
const router = express.Router(); // Création d'un routeur Express

const userCtrl = require('../controllers/user'); // Import du contrôleur des utilisateurs contenant la logique métier

// Définition des routes pour l'inscription et la connexion des utilisateurs
router.post('/signup', userCtrl.signup); // Route pour l'inscription d'un nouvel utilisateur
router.post('/login', userCtrl.login); // Route pour la connexion d'un utilisateur existant

module.exports = router; // Export du routeur pour pouvoir l'utiliser dans d'autres parties de l'application
