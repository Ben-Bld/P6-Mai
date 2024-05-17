const jwt = require("jsonwebtoken"); // Import du module jsonwebtoken pour la gestion des tokens JWT

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extraction du token JWT du header Authorization
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET"); // Vérification et décodage du token avec la clé secrète
    const userId = decodedToken.userId; // Extraction de l'identifiant de l'utilisateur à partir du token décodé
    req.auth = {
      userId: userId, // Ajout de l'identifiant de l'utilisateur à l'objet de requête (req)
    };
    next(); // Passe au middleware suivant
  } catch (error) {
    res.status(401).json({ error }); // Réponse en cas d'erreur d'authentification
  }
};
