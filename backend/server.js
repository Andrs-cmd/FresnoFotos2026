// Paquetes
require("dotenv").config();
const express = require("express");
const app = express();
const routes = require("./api/routes/routes");
const mongoose = require("mongoose");
const path = require("path");

// Modelos
const Request = require("./api/models/Request");
const Queue = require("./api/models/Queue");

// Base de datos
const host = process.env.HOST || "localhost"
// const url = "mongodb://" + host + ":27017/request_app";
const url = "mongodb://api_client_database/request_app";

mongoose.connect(url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Conectado a MongoDB");
}).catch((e) => {
    console.log(e);
    console.log("No fue posible conexión con mongodb");
});

// Configuración
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

// Rutas
routes(app);
app.get("*", (req, res) => {
    res.status(404).send({ url: req.originalUrl + " not found" })
});

global.appRoot = path.resolve(__dirname);

port = process.env.PORT || 3000;
// port = 3000;
app.listen(port);
console.log("Aplicación funcionando en el puerto: " + port);