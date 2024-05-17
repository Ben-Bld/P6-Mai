const multer = require("multer"); //package de gestion de fichiers

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({    //methode multer pour configuer le chemin et le nom des fichiers entrants
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_"); //on remplace les espaces des noms de fichiers d'origines par des _ pour éviter les erreurs
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension); //on créé le nom, en ajoutant un timestamp pour le rendre unique (nom original sans espace + date + extension
  },
});

module.exports= multer({storage}).single('image') //on exporte notre middleware multer, en précisant avec .single qu'il s'agit d'un fichier unique, et d'image