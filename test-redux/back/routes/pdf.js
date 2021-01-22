const express = require('express');
const router = express.Router();
const connection = require("./conf");
const verifyToken = require('./middleware');

// //Ajouter un pdf.

router.post('/',verifyToken, (req, res) => {
    

    connection.query('INSERT INTO pdf (pdf_name, pdf_title) VALUES (?, ?)',

        [req.body.pdf_name, req.body.pdf_title],
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


// // Ici on récupère les données de la table pdf.

router.get('/', (req, res) => {
    connection.query('SELECT * FROM pdf',
        (err, results) => {
            if (err) {
                console.log(err);
            } else {
                res.status(200).json(results);
            }
        });
});

// ici on récupère un pdf


router.get('/:id',
    (req, res) => {
        connection.query('SELECT * FROM pdf WHERE id=?', [req.params.id],
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



// route pour modifier le nom du fichier  pdf, 
// et le titre du fichier pdf

router.put('/:id', verifyToken,
    (req, res) => {
        connection.query(
            "UPDATE pdf SET pdf_name = ?, pdf_title = ? WHERE id= ?",
             [req.body.pdf_name, req.body.pdf_title, req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.json(error)
                } else {
                    connection.query(
                        "SELECT * FROM pdf WHERE id=?", [req.params.id],
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

// route pour modifier le nom du fichier pdf

router.put('/:id', verifyToken,
    (req, res) => {
        connection.query(
            "UPDATE pdf SET pdf_name = ? WHERE id= ?", [req.body.pdf_name, req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.json(error)
                } else {
                    connection.query(
                        "SELECT * FROM pdf WHERE id=?", [req.params.id],
                        (error, results, fields) => {
                            if (error) {
                                res.json(error)
                                console.log('get pdf error: ' + error)
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

// route pour modifier le titre du fichier pdf

router.put('/:id', verifyToken,
    (req, res) => {
        connection.query(
            "UPDATE pdf SET pdf_title = ? WHERE id= ?", [req.body.pdf_title, req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.json(error)
                } else {
                    connection.query(
                        "SELECT * FROM pdf WHERE id=?", [req.params.id],
                        (error, results, fields) => {
                            if (error) {
                                res.json(error)
                                console.log('get pdf error: ' + error)
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


router.delete('/:id', verifyToken,
    (req, res) => {
        connection.query(
            "DELETE FROM pdf WHERE id= ?", [req.params.id],
            (error, results, fields) => {
                if (error) {
                    res.status(501).send("Couldn't delete the pdf." + error);
                    console.log("Delete Failed")
                } else{
                    res.json(req.params.id);
                    console.log("pdf was sucessfully deleted!")
                }
            }
        )
    })


module.exports = router;