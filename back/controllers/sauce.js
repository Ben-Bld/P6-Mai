const Sauce = require("../models/Sauce");
const fs= require("fs")  //donne des methodes pour intéragir avec le systeme de fichier du serveur

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
//empêche utilisateur malveillant de faire une requête en utilisant le user id d'un autre client

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        //on vérifie si un champs file est présent
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body }; //sinon, on récup l'objet dans le corps de la requête

  delete sauceObject._userId; //on supprime le userId de la requête pour éviter qu'un object soit créé à son nom, et reassigné à quelqu'un d'autre

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        // on vérifie que l'objet modifie appartient bien à l'utilisateur qui cherche à le modif
        res.status(401).json({ message: "Not authorized" });
      } else {
        //si c'est le bon user
        //on met à jour l'enregistrement
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};


exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "non autorisé" });
      }else{
         const filename= sauce.imageUrl.split('/image/')[1]
         fs.unlink(`images/${filename}`,()=>{  
          Sauce.deleteOne({_id: req.params.id})
            .then(()=>{res.status(200).json({message: 'objet supprimé'})})
            .catch(error =>res.status(401).json({error}))
         })
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneSauce = (req, res) => {
  Sauce.findOne({_id: req.params.id})
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({error}))
};
exports.getAllSauces = (req, res) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

