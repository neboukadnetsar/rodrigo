const express = require('express');
const router = express.Router();
const passport = require('passport');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const HttpError = require("../HttpError");

const recettesQueries = require("../queries/RecetteQueries");
const evaluationsQueries= require("../queries/EvaluationQueries");

router.get('/', (req, res, next) => {
    recettesQueries.getAllRecettes().then(recettes => {
        res.json(recettes);
    }).catch(err => {
        return next(err);
    });
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    console.log("id:", id);
    recettesQueries.getRecetteById(id).then(recette => {
        if (recette) {
            res.json(recette);
        } else {
            return next(new HttpError(404, `Recette ${id} introuvable`));
        }
    }).catch(err => {
        return next(err);
    });
});

const onePixelTransparentPngImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+P///38ACfsD/QVDRcoAAAAASUVORK5CYII=", "base64");

router.get('/:id/image', (req, res, next) => {
    const id = req.params.id;
    console.log("id:", id);
    recettesQueries.getRecetteImageContent(id).then(imageInfo => {
        if (imageInfo && imageInfo.imageContent) {
            if (imageInfo.imageContentType) {
                res.header('Content-Type', imageInfo.imageContentType);
            }
            res.send(imageInfo.imageContent);
        } else {
            res.header('Content-Type', 'image/png');
            res.send(onePixelTransparentPngImage);
        }
    }).catch(err => {
        return next(err);
    });
});

router.post('/',
    passport.authenticate('basic', { session: false }),
    (req, res, next) => {
        const user = req.user;

        if (!user || !user.isAdmin) {
            return next(new HttpError(403, "Droit administrateur requis"));
        }

        const id = req.body.recetteId;
        if (!id || id === '') {
            return next(new HttpError(400, 'Le champ id est requis'));
        }

        let tempsPrep = req.body.tempsPreparationMinutes;
        if (isNaN(tempsPrep) || tempsPrep < 1) tempsPrep = null;

        let tempsCuisson = req.body.tempsCuissonMinutes;
        if (isNaN(tempsCuisson) || tempsCuisson < 1) tempsCuisson = null;

        let nbPortions = req.body.nbPortions;
        if (isNaN(nbPortions) || nbPortions < 1) nbPortions = null;

        let newIngredients = req.body.ingredients;
        if (newIngredients) {
            if (!Array.isArray(newIngredients)) {
                throw new HttpError(400, `Les ingrédients doivent être sous la forme d'un tableau d'objets`);
            }
            newIngredients = newIngredients.map(ingredient => {
                if (!ingredient.nomIngredient) {
                    throw new HttpError(400, `Les ingrédients doivent avoir un attribut nomIngredient`);
                }
                if (!ingredient.ordreIngredient || !Number.isInteger(ingredient.ordreIngredient)) {
                    throw new HttpError(400, `Les ingrédients doivent avoir un attribut ordreIngredient de type entier`);
                }
                if ((!ingredient.quantite && ingredient.typeUnite)) {
                    throw new HttpError(400, `Les ingrédients possédant un attribut typeUnite doivent comporter un attribut quantite`);
                }
                if (ingredient.quantite && !Number(ingredient.quantite)) {
                    throw new HttpError(400, `L'attribut quantite doit être un nombre`);
                }
                return {
                    nomIngredient: "" + ingredient.nomIngredient,
                    ordreIngredient: Number(ingredient.ordreIngredient),
                    quantite: Number(ingredient.quantite),
                    typeUnite: "" + ingredient.typeUnite
                };
            });
        }

        let newEtapes = req.body.etapes;
        if (newEtapes) {
            if (!Array.isArray(newEtapes)) {
                throw new HttpError(400, `Les étapes doivent être sous la forme d'un tableau d'objets`);
            }
            newEtapes = newEtapes.map(etape => {
                if (!etape.descriptionEtape) {
                    throw new HttpError(400, `Les étapes doivent avoir un attribut descriptionEtape`);
                }
                if (!etape.ordreEtape || !Number.isInteger(etape.ordreEtape)) {
                    throw new HttpError(400, `Les étapes doivent avoir un attribut ordreEtape de type entier`);
                }
                return {
                    descriptionEtape: "" + etape.descriptionEtape,
                    ordreEtape: Number(etape.ordreEtape)
                };
            });
        }

        recettesQueries.getRecetteById(id).then(recette => {
            if (recette) {
                throw new HttpError(400, `Une recette avec l'id ${id} existe déjà`);
            }

            const newRecette = {
                recetteId: "" + id,
                nomRecette: "" + req.body.nomRecette,
                descriptionRecette: "" + req.body.descriptionRecette,
                tempsPreparationMinutes: tempsPrep,
                tempsCuissonMinutes: tempsCuisson,
                nbPortions: nbPortions,
            };

            return recettesQueries.insertRecette(newRecette, newIngredients, newEtapes);
        }).then(result => {
            res.json(result);
        }).catch(err => {
            next(err);
        });
    });

router.put('/:id',
    passport.authenticate('basic', { session: false }),
    (req, res, next) => {
        const user = req.user;

        if (!user || !user.isAdmin) {
            return next(new HttpError(403, "Droit administrateur requis"));
        }

        const id = req.params.id;
        if (!id || id === '') {
            return next(new HttpError(400, 'Le champ id est requis'));
        }

        if (id !== req.body.recetteId) {
            return next(new HttpError(400, `Le paramètre spécifie l'id ${id} alors que la recette fournie a l'id ${req.body.recetteId}`));
        }

        let tempsPrep = req.body.tempsPreparationMinutes;
        if (isNaN(tempsPrep) || tempsPrep < 1) tempsPrep = null;

        let tempsCuisson = req.body.tempsCuissonMinutes;
        if (isNaN(tempsCuisson) || tempsCuisson < 1) tempsCuisson = null;

        let nbPortions = req.body.nbPortions;
        if (isNaN(nbPortions) || nbPortions < 1) nbPortions = null;

        let newIngredients = req.body.ingredients;
        if (newIngredients) {
            if (!Array.isArray(newIngredients)) {
                throw new HttpError(400, `Les ingrédients doivent être sous la forme d'un tableau d'objets`);
            }
            newIngredients = newIngredients.map(ingredient => {
                if (!ingredient.nomIngredient) {
                    throw new HttpError(400, `Les ingrédients doivent avoir un attribut nomIngredient`);
                }
                if (!ingredient.ordreIngredient || !Number.isInteger(ingredient.ordreIngredient)) {
                    throw new HttpError(400, `Les ingrédients doivent avoir un attribut ordreIngredient de type entier`);
                }
                if ((!ingredient.quantite && ingredient.typeUnite)) {
                    throw new HttpError(400, `Les ingrédients possédant un attribut typeUnite doivent comporter un attribut quantite`);
                }
                if (ingredient.quantite && !Number(ingredient.quantite)) {
                    throw new HttpError(400, `L'attribut quantite doit être un nombre`);
                }
                return {
                    nomIngredient: "" + ingredient.nomIngredient,
                    ordreIngredient: Number(ingredient.ordreIngredient),
                    quantite: Number(ingredient.quantite),
                    typeUnite: "" + ingredient.typeUnite
                };
            });
        }

        let newEtapes = req.body.etapes;
        if (newEtapes) {
            if (!Array.isArray(newEtapes)) {
                throw new HttpError(400, `Les étapes doivent être sous la forme d'un tableau d'objets`);
            }
            newEtapes = newEtapes.map(etape => {
                if (!etape.descriptionEtape) {
                    throw new HttpError(400, `Les étapes doivent avoir un attribut descriptionEtape`);
                }
                if (!etape.ordreEtape || !Number.isInteger(etape.ordreEtape)) {
                    throw new HttpError(400, `Les étapes doivent avoir un attribut ordreEtape de type entier`);
                }
                return {
                    descriptionEtape: "" + etape.descriptionEtape,
                    ordreEtape: Number(etape.ordreEtape)
                };
            });
        }

        const newRecette = {
            recetteId: "" + id,
            nomRecette: "" + req.body.nomRecette,
            descriptionRecette: "" + req.body.descriptionRecette,
            tempsPreparationMinutes: tempsPrep,
            tempsCuissonMinutes: tempsCuisson,
            nbPortions: nbPortions,
        };

        recettesQueries.updateRecette(newRecette, newIngredients, newEtapes).then(result => {
            if (!result) {
                return next(new HttpError(404, `Recette ${id} introuvable`));
            }

            res.json(result);
        }).catch(err => {
            return next(err);
        });
    });

router.delete('/:id',
    passport.authenticate('basic', { session: false }),
    (req, res, next) => {
        const user = req.user;

        if (!user || !user.isAdmin) {
            return next(new HttpError(403, "Droit administrateur requis"));
        }

        const id = req.params.id;
        if (!id || id === '') {
            return next(new HttpError(400, 'Le paramètre id est requis'));
        }

        recettesQueries.deleteRecette(id).then(result => {
            if (!result) {
                return next(new HttpError(404, `Recette ${id} introuvable`));
            }

            res.json(result);
        }).catch(err => {
            return next(err);
        });
    });


router.put('/:id/image',
    passport.authenticate('basic', { session: false }),

    upload.single('recette-image'), 
    (req, res, next) => {
        
        const user = req.user;
        if (!user || !user.isAdmin) {
            return next(new HttpError(403, "Droit administrateur requis"));
        }
        
        const id = req.params.id;
        if (!id || id === '') {
            return next(new HttpError(400, 'Le champ id est requis'));
        }

        recettesQueries.getRecetteById(id).then(recette => {
            if (!recette) {
                throw new HttpError(404, `Recette id ${id} introuvable`);
            }

            return recettesQueries.updateRecetteImage(id, req.file.buffer, req.file.mimetype);
        }).then(imageInfo => {
            res.send("");
        }).catch(err => {
            next(err);
        });
    });


router.post('/commentaires/:id',
    passport.authenticate('basic', { session: false }),
    (req, res, next) => {
        const user = req.user;

        const recipeId = req.params.id;
        if (!recipeId || recipeId === '') {
            return next(new HttpError(400, "L'identifiant de recette est requis"));
        }

        const comment = req.body.comment;
        if (!comment || comment == '') {
            return next(new HttpError(400, "Commentaire ne peut être vide"));
        }

        recettesQueries.getRecetteById(recipeId).then(recipe => {
            if (!recipe) throw new HttpError(404, `Recette ${recipeId} introuvable`);
        }).catch(err => {
            next(err);
        });

        recettesQueries.insertComment(recipeId, user.userId, comment).then(() => {
            res.send("");
        }).catch(err => {
            next(err);
        });
    });

router.get('/commentaires/:id', (req, res, next) => {
    const recetteId = req.params.id;
    if (!recetteId || recetteId === '') {
        return next(new HttpError(400, 'Le champ id est requis'));
    }

    recettesQueries.getRecetteById(recetteId).then(recette => {
        if (!recette) {
            throw new HttpError(404, `Recette id ${recetteId} introuvable`);
        }

        return recettesQueries.getAllCommentsByRecipe(recetteId);
    }).then(comments => {
        res.json(comments);
    }).catch(err => {
        return next(err);
    });
});

router.get('/evaluations/:id', (req, res, next) => {
    const recetteId = req.params.id;
    if (!recetteId || recetteId === '') {
        return next(new HttpError(400, 'Le champ id est requis'));
    }

    recettesQueries.getRecetteById(recetteId).then(recette => {
        if (!recette) {
            throw new HttpError(404, `Recette id ${recetteId} introuvable`);
        }

        return evaluationsQueries.getAverageRating(recetteId);
    }).then(rating => {
        res.json(rating);
    }).catch(err => {
        return next(err);
    });
});

module.exports = router;



