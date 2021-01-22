const express = require('express');
const router = express.Router();
const site_texts = require('./site_texts');
const contact = require('./contact');
const users = require('./users');
const images = require('./images');
// const fileUpload = require('../upload');
const pdf = require("./pdf");
// const pdfUpload = require("../pdfUpload");
// const pdfs = require("../pdfs");
const token = require ("./token")




router.use('/site_texts', site_texts);
router.use('/contact', contact);
router.use('/users', users);
router.use('/images', images);
// router.use('/fileupload', fileUpload);
// router.use('/pdf', pdf);
// router.use('/pdfUpload', pdfUpload);
// router.use('/pdfs', pdfs);
router.use('/token', token);


module.exports = router;