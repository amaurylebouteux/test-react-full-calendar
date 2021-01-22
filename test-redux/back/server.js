const fs = require('fs');
const path = require('path');
const api = require ('./routes');
const https = require('https');
const bodyParser = require("body-parser");
const express = require('express');
const cookieParser = require ('cookie-parser');
require ('dotenv').config();
const port = process.env.REACT_APP_SERVER_ADDRESS;
const cors = require ('cors');
 
/* On créer notre application Express */
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET, POST, PUT, DELETE',
  credentials: true
}

app.use(cors(corsOptions));
app.use(cookieParser());
app.use('/pictures', express.static('public/pictures'));
app.use(bodyParser.json());
app.use("/pdfs", express.static ("public/pdfs"));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/api', api);
 
/* On récupère notre clé privée et notre certificat (ici ils se trouvent dans le dossier certificate) */
const key = fs.readFileSync(path.join(__dirname, 'certificate', 'server.key'));
const cert = fs.readFileSync(path.join(__dirname, 'certificate', 'server.cert'));
 
const options = { key, cert };
 
/* Puis on créer notre serveur HTTPS */
const server = https.createServer(options, app).listen(port, () => {
  console.log(`App is running ! Go to https://localhost:${port}`);
});

module.exports = server;