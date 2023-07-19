const express = require('express');
const router = express.Router();

const unitesQueries = require("../queries/UniteQueries");

router.get('/', (req, res, next) => {
    unitesQueries.getAllUnites().then(unites => {
        res.json(unites);
    }).catch(err => {
        return next(err);
    });
});

module.exports = router;
