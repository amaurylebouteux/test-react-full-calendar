const express = require('express');
const router = express.Router();
const connection = require("./conf");
const verifyToken = require('./middleware');

 //Ajouter une texte.

router.post('/',verifyToken, (req, res) => {
    

    connection.query('INSERT INTO site_texts (category, text_title, text_content) VALUES (?, ?, ?)',

        [req.body.category, req.body.text_title, req.body.text_content],
        (err, results, fields) => {
            if (err) {
                console.log(err);
            } else {
                console.log("OK !");
                req.body.id = results.insertId;
                res.json(req.body);
            }
        })

});


 // Ici on récupère les données de la table site_texts.

router.get('/', (req, res) => {
    connection.query('SELECT * FROM site_texts',
        (err, results) => {
            if (err) {
                console.log(err);
            } else {
                res.status(200).json(results);
            }
        });
});

// ici on récupère un texte et son titre


router.get('/:id',
    (req, res) => {
        connection.query('SELECT * FROM site_texts WHERE id=?', [req.params.id],
        (error, results, fields) => {
            if (error) {
                res.json(error);
            } else if (results.length === 0) {
                res.status(404).json("invalid id")
            } else {
                res.json(results[0]);
            }
        })
    })

    // ici, on récupère une catégorie de textes

router.get('/category/:cat',
(req, res) => {
    connection.query('SELECT * FROM site_texts WHERE category=?', [req.params.cat],
    (error, results, fields) => {
        if (error) {
            res.json(error);
        } else if (results.length === 0) {
            res.status(404).json("invalid category");
        } else {
            res.json(results);
        }
    }
    )
})

    //ici, on récupère un texte, mais pas son titre

    router.get('/text_content/:id', (req, res) => {
        connection.query('SELECT text_content FROM site_texts WHERE id=?', [req.params.id],
            (err, results) => {
                if (err) {
                    console.log(err);
                } else {
                    
                    res.status(200).json(results);
                }
            });
    });

// ici, on modifie un texte


router.put('/:id', verifyToken,
    (req, res) => {
        console.log(req.body);
        connection.query(
            "UPDATE site_texts SET category= ?, text_title = ?, text_content = ? WHERE id= ?", 
            [req.body.category, req.body.text_title, req.body.text_content, req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.json(error)
                } else {
                    connection.query(
                        "SELECT * FROM site_texts WHERE id=?", [req.params.id],
                        (error, results, fields) => {
                            if (error) {
                                res.json(error)
                            } else {
                                res.json(results[0]);
                                console.log('results: ' + results[0]);
                            }
                        }
                    )
                }
            }
        )
    }
);


// //Modification d'un enregistrement de la table site_texts.

router.put('/text_content/:id', verifyToken,
    (req, res) => {
        connection.query(
            "UPDATE site_texts SET text_content = ? WHERE id= ?", [req.body.text_content, req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.json(error)
                    console.log(error)
                } else {
                    connection.query(
                        "SELECT * FROM site_texts WHERE id=?", [req.params.id],
                        (error, results, fields) => {
                            if (error) {
                                res.json(error)
                                console.log(error)
                            } else {
                                res.json(results[0]);
                                console.log("fetch ok!")
                            }
                        }
                    )
                }
            }
        )
    }
);


// //Modification d'un titre de la table site_texts.

router.put('/text_title/:id', verifyToken,
    (req, res) => {
        connection.query(
            "UPDATE site_texts SET text_title = ? WHERE id= ?", [req.body.text_title, req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.json(error)
                    console.log(error)
                } else {
                    connection.query(
                        "SELECT * FROM site_texts WHERE id=?", [req.params.id],
                        (error, results, fields) => {
                            if (error) {
                                res.json(error)
                                console.log(error)
                            } else {
                                res.json(results[0]);
                                console.log("fetch ok!")
                            }
                        }
                    )
                }
            }
        )
    }
);

// Ici, on efface un texte et son titre.

router.delete('/:id', verifyToken,
    (req, res) => {
        connection.query(
            "DELETE FROM site_texts WHERE id= ?", [req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.status(501).send("Couldn't delete the text." + error);
                    console.log("Delete Failed")
                } else{
                    res.json(req.params.id);
                    console.log("Text was sucessfully deleted!")
                }
            }
        )
    })


module.exports = router;