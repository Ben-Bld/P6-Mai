const multer = require("multer"); // Import du package de gestion de fichiers multer

// Définition des types MIME pour les extensions d'images autorisées
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Configuration du stockage des fichiers avec multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => { // Définition du dossier de destination des fichiers
    callback(null, "images"); // Destination des fichiers dans le dossier "images"
  },
  filename: (req, file, callback) => { // Définition du nom de fichier
    const name = file.originalname.split(" ").join("_"); // Remplacement des espaces dans le nom de fichier par des underscores
    const extension = MIME_TYPES[file.mimetype]; // Récupération de l'extension de fichier correspondant au type MIME
    callback(null, name + Date.now() + "." + extension); // Création du nom de fichier unique en ajoutant un timestamp
  },
});

module.exports = multer({ storage }).single('image'); // Export du middleware multer configuré pour gérer les fichiers, avec précision qu'il s'agit d'un fichier unique et d'image
