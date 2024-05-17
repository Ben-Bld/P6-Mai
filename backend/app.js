// Import des modules nécessaires
require('dotenv').config();
const express = require("express"); // Import du framework Express
const bodyParser = require("body-parser"); // Import du module body-parser pour l'analyse des corps de requête
const mongoose = require("mongoose"); // Import du module mongoose pour la gestion de MongoDB
const morgan = require("morgan"); // Import du module morgan pour la journalisation des requêtes HTTP
const path = require("path"); // Import du module path pour la gestion des chemins de fichiers
const helmet = require("helmet"); // Import du module helmet pour la sécurité des applications Express
const cors = require("cors"); // Import du module cors pour la gestion des requêtes CORS




// Import des fichiers de routes
const sauceRoutes = require("./routes/sauce.js"); // Import des routes pour les sauces
const userRoutes = require("./routes/user.js"); // Import des routes pour les utilisateurs

// Création de l'application Express
const app = express();

// Utilisation des middlewares
app.use(cors()); // Middleware pour autoriser les requêtes depuis toutes les origines
app.use(express.json()); // Middleware intégré pour l'analyse des corps de requête au format JSON
app.use(morgan("dev")); // Middleware pour la journalisation des requêtes en mode développement
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" }, // Middleware pour sécuriser les en-têtes HTTP
  })
);
const USER = process.env.USER_DB;
const PASSWORD = process.env.PASSWORD_DB;
const DATABASE = process.env.NAME_DB;
const APPNAME= process.env.APPNAME_DB

const uri = `mongodb+srv://${USER}:${PASSWORD}@${DATABASE}.o1kxqsm.mongodb.net/?retryWrites=true&w=majority&appName=${APPNAME}`


// Connexion à la base de données MongoDB
mongoose
  .connect(uri,
    { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Utilisation des middlewares de bodyParser pour l'analyse des corps de requête
app.use(bodyParser.json());

// Définition des routes
app.use("/api/sauces", sauceRoutes); // Routes pour les sauces
app.use("/api/auth", userRoutes); // Routes pour les utilisateurs
app.use("/images", express.static(path.join(__dirname, "images"))); // Middleware pour servir les fichiers statiques

// Export de l'application
module.exports = app;