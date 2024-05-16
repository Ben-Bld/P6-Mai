const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");

const sauceRoutes = require("./routes/sauce.js");
const userRoutes = require("./routes/user.js");
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
  })
); 

mongoose
  .connect(
    "mongodb+srv://test1:test1@occours.eq6kq4w.mongodb.net/?retryWrites=true&w=majority&appName=OcCours", //Add your connection string from MongoDB
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connection à MongoDB réussie"))
  .catch(() => console.log("Connection à MongoDB échouée"));

app.use(express.json());

app.use(bodyParser.json());

app.use("/api/sauce", sauceRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));
module.exports = app;
