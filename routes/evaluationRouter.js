const express = require('express');
const router = express.Router();
const passport = require('passport');

const recettesQueries = require("../queries/RecetteQueries");
const evaluationsQueries= require("../queries/EvaluationQueries");
const HttpError = require("../HttpError");

router.get('/:id',
    passport.authenticate('basic', { session: false }),
    (req, res, next) => {
        const user = req.user;

        const recipeId = req.params.id;
        if (!recipeId || recipeId === '') {
            return next(new HttpError(400, "L'identifiant de recette est requis"));
        }

        recettesQueries.getRecetteById(recipeId).then(recette => {
            if (!recette) {
                throw new HttpError(404, `Recette ${recipeId} introuvable`);
            }

            return evaluationsQueries.getRatingByIds(recipeId, user.userId);
        }).then((evaluation => {
            if (evaluation) {
                res.send({
                    userId: evaluation.user_id,
                    recetteId: evaluation.recette_id,
                    rating: evaluation.rating
                });
            } else {
                res.send({
                    userId: user.userId,
                    recetteId: recipeId,
                    rating: null
                });
            }
        })).catch(err => {
            next(err);
        });
    });

router.put('/:id',
    passport.authenticate('basic', { session: false }),
    (req, res, next) => {
        const user = req.user;

        const recipeId = req.params.id;
        if (!recipeId || recipeId === '') {
            return next(new HttpError(400, "L'identifiant de recette est requis"));
        }

        const rating = req.body.rating;
        if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
            return next(new HttpError(400, "L'évalutation doit être un nombre entre 1 et 5 inclusivement"));
        }

        recettesQueries.getRecetteById(recipeId).then(recipe => {
            if (!recipe) throw new HttpError(404, `Recette ${recipeId} introuvable`);
        }).catch(err => {
            next(err);
        });

        evaluationsQueries.getRatingByIds(recipeId, user.userId).then((evaluation) => {
            if (!evaluation) {
                return recettesQueries.insertRating(recipeId, user.userId, rating);
            } else {
                return recettesQueries.updateRating(recipeId, user.userId, rating);
            }
        }).then(() => {
            res.send("");
        }).catch(err => {
            next(err);
        });

    });

module.exports = router;
