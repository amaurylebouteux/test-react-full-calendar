const express = require('express');
const router = express.Router();
const connection = require("./conf");
const verifyToken = require('./middleware');

// //Ajouter une image.

router.post('/',verifyToken, (req, res) => {
    

    connection.query('INSERT INTO images (category, image_title, image_link) VALUES (?, ?, ?)',

        [req.body.category, req.body.image_title, req.body.image_link],
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


// // Ici on récupère les données de la table image.

router.get('/', (req, res) => {
    connection.query('SELECT * FROM images',
        (err, results) => {
            if (err) {
                console.log(err);
            } else {
                res.status(200).json(results);
            }
        });
});

// ici on récupère une image


router.get('/:id',
    (req, res) => {
        connection.query('SELECT * FROM images WHERE id=?', [req.params.id],
        (error, results, fielsd) => {
            if (error) {
                res.json(error);
            } else if (results.length === 0) {
                res.status(404).json("invalid id")
            } else {
                res.json(results[0]);
            }
        })
    })

// ici, on récupère une catégorie d'images

router.get('/category/:cat',
(req, res) => {
    connection.query('SELECT * FROM images WHERE category=?', [req.params.cat],
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

// route por modifier la catégorie, le nom du fichier  image, 
// et le titre de l'image

router.put('/:id', verifyToken,
    (req, res) => {
        connection.query(
            "UPDATE images SET category = ?, image_title = ?, image_link = ? WHERE id= ?", [req.body.category, req.body.image_title, req.body.image_link, req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.json(error)
                } else {
                    connection.query(
                        "SELECT * FROM images WHERE id=?", [req.params.id],
                        (error, results, fields) => {
                            if (error) {
                                res.json(error)
                            } else {
                                res.json(results[0]);
                            }
                        }
                    )
                }
            }
        )
    }
);

// route pour modifier le nom du fichier image

router.put('/:id', verifyToken,
    (req, res) => {
        connection.query(
            "UPDATE images SET image_link = ? WHERE id= ?", [req.body.image_link, req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.json(error)
                } else {
                    connection.query(
                        "SELECT * FROM images WHERE id=?", [req.params.id],
                        (error, results, fields) => {
                            if (error) {
                                res.json(error)
                                console.log('get image error: ' + error)
                            } else {
                                res.json(req.body);
                            }
                        }
                    )
                }
            }
        )
    }
);

// route pour modifier le titre de l'image

router.put('/image_title/:id', verifyToken,
    (req, res) => {
        connection.query(
            "UPDATE images SET image_title = ? WHERE id= ?", [req.body.image_title, req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.json(error)
                } else {
                    connection.query(
                        "SELECT * FROM images WHERE id=?", [req.params.id],
                        (error, results, fields) => {
                            if (error) {
                                res.json(error)
                                console.log('get image error: ' + error)
                            } else {
                                res.json(results);
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
            "DELETE FROM images WHERE id= ?", [req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.status(501).send("Couldn't delete the image." + error);
                    console.log("Delete Failed")
                } else{
                    res.json(req.params.id);
                    console.log("Image was sucessfully deleted!")
                }
            }
        )
    })


module.exports = router;