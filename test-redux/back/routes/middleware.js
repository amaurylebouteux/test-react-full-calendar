
const express = require('express');
const router = express.Router();
const connection = require('./conf');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const jwtsecret = process.env.JWTSECRET;
const jwtalgorithm = process.env.JWT_ALGORITHM;
const parser = require('body-parser');



router.use(parser.json());


async function verifyToken(req, res, next) {

  
  try {
    
    const{ cookies, headers} = req;
    console.log("cookie: " + cookies);

    /* On vérifie que le JWT est présent dans les cookies de la requête */
    if (!cookies || !cookies.access_token) {
      return res.status(401).json({
        message: 'Missing token in cookie'
      });
      
    }

    const accessToken = cookies.access_token;
 
    /* On vérifie que le token CSRF est présent dans les en-têtes de la requête */
    if (!headers || !headers['x-xsrf-token']) {
      
      return res.status(401).json({ message: 'Missing XSRF token in headers' });
    }
 
    const incomingXsrfToken = headers['x-xsrf-token'];
    console.log('xsrfToken dans verifyToken: ' + incomingXsrfToken);


    /* 3. On vérifie et décode le token à l'aide du secret 
    et de l'algorithme utilisé pour le générer */
    const decodedToken = jwt.verify(accessToken, jwtsecret, {
      algorithms: jwtalgorithm
    });

    if (incomingXsrfToken !== decodedToken.xsrfToken) {
      console.log('decoded xsrftoken: ' + decodedToken.xsrfToken);
      return res.status(401).json({ message: 'Bad xsrf token' });
    }

    /* 4. On vérifie que l'utilisateur existe bien dans notre base de données */

    const userId = decodedToken.sub;
    console.log("userId dans le middleware: " + userId);

    const user = await connection.query(
      "SELECT * FROM users WHERE id=?", [userId],
      (error, results, authenticationData) => {
        if (error) {
          console.log("user doesn't exist");
          res.status(401).send("Cet utilisateur n'existe pas");
        } else {

          console.log("results.users à la fin du middleware" + authenticationData);
          req.authenticationData = authenticationData;
          if (!user) {
            return res.status(401).json({
              message: `User ${userId} not exists`
            });
          }



          /* 5. On passe l'utilisateur dans notre requête afin que celui-ci soit disponible pour les prochains middlewares */
          req.user = user;
          console.log("req.user: " + req.user);
        }

        /* 7. On appelle le prochain middleware */
        return next();
      })
  } catch (err) {

    return res.status(401).json({
      message: 'Invalid token'
    });
    console.log('Invalid token');
  }
}

module.exports = verifyToken;