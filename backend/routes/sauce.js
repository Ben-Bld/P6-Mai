const express = require("express"); // Import du framework Express pour créer des routes
const router = express.Router(); // Création d'un routeur Express

const auth = require('../middleware/auth'); // Import du middleware d'authentification pour sécuriser les routes
const multer = require('../middleware/multer-config'); // Import du middleware multer pour la gestion des fichiers

const sauceCtrl = require('../controllers/sauce'); // Import du contrôleur des sauces contenant la logique métier

// Définition des routes pour les différentes actions sur les sauces
router.get('/', auth, sauceCtrl.getAllSauces); // Route pour récupérer toutes les sauces
router.post('/', auth, multer, sauceCtrl.createSauce); // Route pour créer une nouvelle sauce
router.get('/:id', auth, sauceCtrl.getOneSauce); // Route pour récupérer une seule sauce par son identifiant
router.put('/:id', auth, multer, sauceCtrl.modifySauce); // Route pour modifier une sauce existante
router.delete('/:id', auth, sauceCtrl.deleteSauce); // Route pour supprimer une sauce existante
router.post('/:id/like', auth, sauceCtrl.likeSauce); // Route pour gérer les likes/dislikes sur une sauce

module.exports = router; // Export du routeur pour pouvoir l'utiliser dans d'autres parties de l'application
