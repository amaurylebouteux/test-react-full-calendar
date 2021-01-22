const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const connection = require("./conf");
const verifyToken = require('./middleware');
const { json } = require('body-parser');
const { send } = require('process');
require('dotenv').config();
const salt = process.env.SALT;
const jwtsecret = process.env.JWTSECRET;
const jwtalgorithm = process.env.JWT_ALGORITHM;
const jwtaudience = process.env.JWT_AUDIENCE;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
const tokenType = process.env.TOKEN_TYPE;
const refreshTokenExpiresIn = process.env.REFRESHTOKEN_EXPIRES_IN;




router.post(
    "/", async (req, res) => {
        try {
            const { cookies } = req;
            console.log('cookies dans token: ' + req.cookies.refresh_token + ' ' + req.cookies.userId);
            await connection.query(
                "SELECT refreshtoken.id, refreshtoken.userId, refreshtoken.token, refreshtoken.expiresAt, users.username FROM refreshtoken RIGHT JOIN users ON refreshtoken.userId = users.id WHERE userId = ? AND refreshtoken.token=?", [req.cookies.userId, req.cookies.refresh_token],
                async (error, results, fields) => {
                    console.log("refreshtoken dans token.js: " + req.cookies.refresh_token + ' ' + req.cookies.userId);
                    console.log('refreshtoken from table: ' + results);

                    if (cookies.refresh_token == results[0].token && cookies.userId == results[0].userId) {
                        console.log('results in token: ' + results[0].token + ' ' + results[0].userId);
                        // res.status(200).send('refreshtoken exists');

                        const username = results[0].username;

                        const xsrfToken = crypto.randomBytes(64).toString('hex');
                        console.log('newXsrfToken: ' + xsrfToken);

                        const accessToken = jwt.sign({ username: username, xsrfToken },
                            jwtsecret,
                            {
                                algorithm: jwtalgorithm,
                                audience: jwtaudience,
                                expiresIn: jwtExpiresIn,

                                subject: results[0].userId.toString()
                            });

                       

                        res.cookie('access_token', accessToken, {
                            httpOnly: true,
                            maxAge: jwtExpiresIn // Le temps d'expiration du cookie en ms
                        });
                        
                        console.log('new refreshtoken: ' + cookies['refresh_token']);


                        /* On envoie  une réponse JSON contenant les durées de vie des tokens et le xsrfToken*/
                        res.json({
                            accessTokenExpiresIn: jwtExpiresIn,
                            refreshTokenExpiresIn: refreshTokenExpiresIn,
                            xsrfToken,
                        });
                        res.status(200);



                    } else {
                        console.log('refreshToken from table: ' + results[0].token + ' ' + results[0].userId);
                        res.status(401).send("You have been disconnected.")
                    }

                }
            );
        } catch (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
)

module.exports = router;