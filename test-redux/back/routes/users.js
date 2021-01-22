const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const connection = require("./conf");
const verifyToken = require('./middleware');
const { json } = require('body-parser');
require('dotenv').config();
const salt = process.env.SALT;
const jwtsecret = process.env.JWTSECRET;
const jwtalgorithm = process.env.JWT_ALGORITHM;
const jwtaudience = process.env.JWT_AUDIENCE;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
const refreshTokenExpiresIn = process.env.REFRESHTOKEN_EXPIRES_IN;




router.post(
    "/register", verifyToken,
    (req, res) => {
        const users = req.body;
        if (users.username.length <= 1 || users.password.length <= 7) {
            res.status(400).send("nom d'utilisateur ou mot de passe incorrect")
        } else {

            connection.query(
                "INSERT INTO users (username , password) VALUES (?, ?)",
                [users.username, bcrypt.hashSync(users.password, salt)],
                (error, results, fields) => {
                    if (error) {
                        res.status(500).send(error);

                    } else {
                        users.id = results.insertId
                        res.status(201).json(req.body);
                        console.log("users.username: " + users.username);
                    }
                }
            )
        }

    }




)


// route pour l'authentification d'un utilisateur

router.post('/login', async (req, res) => {

    try {
        /* 1. On récupère le nom d'utilisateur et le mot de passe dans la requête */
        
        const users = req.body;
        const crypted = bcrypt.hashSync(users.password, salt);
        console.log("crypted before try: " + crypted)


        /* 2. On envoie une erreur au client si le paramètre username est manquant */
        if (!users.username) {
            return res.status(400).json({ message: 'missing_required_parameter', info: 'username' });
        }
        /* 3. On envoie une erreur au client si le paramètre password est manquant */
        if (!users.password) {
            console.log('crypted: ' + crypted)
            return res.status(400).json({ message: 'missing_required_parameter', info: 'password' });
        }

        /* 4. On authentifie l'utilisateur */
        await connection.query(
            "SELECT * FROM users WHERE username=? AND password=?", [users.username, crypted],
            (error, results, fields) => {
                if (error) {
                    
                    res.status(401).send("Nom d'utilisateur ou mot de passe incorrect");
                } else {

                    const xsrfToken = crypto.randomBytes(64).toString('hex');

                    const users = results[0];
                    const accessToken = jwt.sign(
                        { username: users.username, xsrfToken },
                        jwtsecret,
                        {
                            algorithm: jwtalgorithm,
                            audience: jwtaudience,
                            expiresIn: jwtExpiresIn,

                            subject: users.id.toString()
                        }
                    );

                    /* 7. On créer le refresh token et on le stocke en BDD */
                    const refreshToken = crypto.randomBytes(128).toString('base64');
                    

                    connection.query("DELETE FROM refreshtoken WHERE userId = ?",[users.id], 
                    (error) => {
                        if (error) {
                            res.sendStatus(500)
                        } else {

                            connection.query("INSERT INTO refreshtoken (userId, token, expiresAt) VALUES (?, ?, ?)",
                        [users.id, refreshToken, refreshTokenExpiresIn])

                    

                    /* 7. On envoie au client le JWT et le refresh token */

                    /* On crée le cookie contenant le JWT */
                    res.cookie('access_token', accessToken, {
                        httpOnly: true,
                        maxAge: jwtExpiresIn, // Le temps d'expiration du cookie en ms
                        path: '/'
                    });

                    /* On crée le cookie contenant le refresh token */
                    
                    res.cookie('refresh_token', refreshToken, {
                        httpOnly: true,
                        maxAge: refreshTokenExpiresIn,                        
                        // path: 'https://localhost:8000/' // Ce cookie ne sera envoyé que sur la route /token

                    });
                    res.cookie('userId', `${users.id}`, {
                        httpOnly: true,
                        maxAge:refreshTokenExpiresIn
                        // path: '/token' // Ce cookie ne sera envoyé que sur la route /token

                    });

                    /* On envoie tout de même une réponse JSON contenant les durées de vie des tokens */
                    res.json({
                        accessTokenExpiresIn: jwtExpiresIn,
                        refreshTokenExpiresIn: refreshTokenExpiresIn,
                        xsrfToken,
                    });

                        }
                    })

                    

                }
            })




    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }

});





// contrôle du nom d'utilisateur

router.post(
    "/verify", verifyToken,
    (req, res) => {
        const user = req.body;
        console.log("verified user: " + user.username);
        connection.query(
            'SELECT * FROM users WHERE username= ?', [req.body.username],
            (err, result) => {
                console.log("body requête: " + req.body.username)

                if (result[0] === undefined) {

                    res.status(500).json(err);

                } else if (result[0].username === req.body.username) {
                    res.status(200).send("200");
                }
            }
        )
    }
)

//lecture de la table users.


router.get(
    "/", verifyToken,
    (req, res) => {
        connection.query(
            'SELECT * FROM users ',
            (error, results, fields) => {
                if (error) {
                    res.json(error);
                } else {
                    res.status(200).json(results);
                    console.log('results from the get route' + results);
                }
            })
    }
);



// modification de la table users.

router.put('/:id', verifyToken,
    (req, res) => {

        const users = req.body;
        console.log('this is the user:' + req.body);
        const crypted = bcrypt.hashSync(users.password, salt);
        console.log('this is the result of the hash' + crypted);


        connection.query(
            "UPDATE users SET username = ?, password = ? WHERE id= ? AND id!=1", [req.body.username, crypted, req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.json(error)
                } else {
                    connection.query(
                        "SELECT * FROM users WHERE id=?", [req.params.id],
                        (error, results, fields) => {
                            if (error) {
                                res.json(error)
                            } else {

                                res.json(results[0]);
                                console.log("req.body route put: " + results[0].id);
                            }
                        }
                    )
                }
            }
        )
    }
);


router.delete('/:id', verifyToken,
    (req, res) => {
        connection.query(
            "DELETE FROM users WHERE id= ? AND id>1", [req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.status(501).send("Couldn't delete the image." + error);

                }
                res.status(204).send("OK")
            }
        )
    })




module.exports = router;