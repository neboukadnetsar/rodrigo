const pool = require('./DBPool');
const HttpError = require("../HttpError");

const getImagePathForRecetteId = recetteId => `/recettes/${recetteId}/image`;
exports.getImagePathForRecetteId = getImagePathForRecetteId;

const RECETTE_ID = "recette_id";
const NOM_RECETTE = "nom_recette";
const DESCRIPTION = "description";
const ORDRE = "ordre";
const DESCRIPTION_RECETTE = "description_recette";
const TEMPS_PREPARATION_MINUTES = "temps_preparation_minutes";
const TEMPS_CUISSON_MINUTES = "temps_cuisson_minutes";
const NB_PORTIONS = "nb_portions";
const RATING = "rating";
const RATING_MOYEN = "rating_moyen";
const ETAPE_KEY = "etape_key";
const DESCRIPTION_ETAPE = "description_etape";
const ORDRE_ETAPE = "ordre_etape";
const INGREDIENT_KEY = "ingredient_key";
const NOM_INGREDIENT = "nom_ingredient";
const ORDRE_INGREDIENT = "ordre_ingredient";
const QUANTITE = "quantite";
const UNITE_KEY = "unite_key";
const TYPE_UNITE = "type_unite";
const COMMENTAIRE_KEY = "commentaire_key";
const COMMENTAIRE = "commentaire";
const DATE_HEURE = "date_heure";
const USER_ID = "user_id";
const USER_FULL_NAME = "user_full_name";
const IMAGE_CONTENT = "image_content";
const IMAGE_CONTENT_TYPE = "image_content_type";

const RECETTE_TABLE = "recette";
const ETAPE_TABLE = "etape";
const INGREDIENT_TABLE = "ingredient";
const UNITE_MESURE_TABLE = "unite_mesure";
const APPRECIATION_TABLE = "appreciation";
const COMMENTAIRE_TABLE = "commentaire";
const USER_ACCOUNT_TABLE = "user_account";

const getAllRecettes = async () => {
    const result = await pool.query(
        `SELECT r.${RECETTE_ID}, r.${NOM_RECETTE}, r.${DESCRIPTION} AS ${DESCRIPTION_RECETTE}, r.${TEMPS_PREPARATION_MINUTES}, r.${TEMPS_CUISSON_MINUTES}, r.${NB_PORTIONS},
        e.${ETAPE_KEY}, e.${DESCRIPTION} AS ${DESCRIPTION_ETAPE}, e.${ORDRE} AS ${ORDRE_ETAPE},
        i.${INGREDIENT_KEY}, i.${NOM_INGREDIENT}, i.${ORDRE} AS ${ORDRE_INGREDIENT}, i.${QUANTITE},
        u.${UNITE_KEY}, u.${TYPE_UNITE},
        ROUND(AVG(a.${RATING}),1) AS ${RATING_MOYEN}
        FROM ${RECETTE_TABLE} r
        LEFT JOIN ${ETAPE_TABLE} e ON r.${RECETTE_ID} = e.${RECETTE_ID}
        LEFT JOIN ${INGREDIENT_TABLE} i ON r.${RECETTE_ID} = i.${RECETTE_ID}
        LEFT JOIN ${UNITE_MESURE_TABLE} u ON i.${UNITE_KEY} = u.${UNITE_KEY}
        LEFT JOIN ${APPRECIATION_TABLE} a ON r.${RECETTE_ID} = a.${RECETTE_ID}
        GROUP BY r.${RECETTE_ID}, e.${ETAPE_KEY}, i.${INGREDIENT_KEY}, u.${UNITE_KEY}
        ORDER BY r.${RECETTE_ID}, e.${ORDRE}, i.${ORDRE}`
    );

    const recettes = [];
    let recetteCourante = null;
    let etapeCourante = null;
    let ingredientCourant = null;

    result.rows.forEach(row => {
        if (!recetteCourante || recetteCourante.recetteId !== row[RECETTE_ID]) {
            recetteCourante = createRecetteFromRow(row);
            recettes.push(recetteCourante);
        }

        if (row[ETAPE_KEY] && !recetteCourante.etapes.some(etape => etape.etapeKey === row[ETAPE_KEY])) {
            etapeCourante = createEtapeFromRow(row);
            recetteCourante.etapes.push(etapeCourante);
        }

        if (row[INGREDIENT_KEY] && !recetteCourante.ingredients.some(ingredient => ingredient.ingredientKey === row[INGREDIENT_KEY])) {
            ingredientCourant = createIngredientFromRow(row);
            recetteCourante.ingredients.push(ingredientCourant);
        }
    });

    return recettes;
};
exports.getAllRecettes = getAllRecettes;


const getRecetteById = async (recetteId) => {
    let result = await pool.query(
        `SELECT r.${RECETTE_ID}, r.${NOM_RECETTE}, r.${DESCRIPTION} AS ${DESCRIPTION_RECETTE}, r.${TEMPS_PREPARATION_MINUTES}, r.${TEMPS_CUISSON_MINUTES}, r.${NB_PORTIONS},
        e.${ETAPE_KEY}, e.${DESCRIPTION} AS ${DESCRIPTION_ETAPE}, e.${ORDRE} AS ${ORDRE_ETAPE},
        i.${INGREDIENT_KEY}, i.${NOM_INGREDIENT}, i.${ORDRE} AS ${ORDRE_INGREDIENT}, i.${QUANTITE},
        u.${UNITE_KEY}, u.${TYPE_UNITE},
        ROUND(AVG(a.${RATING}),1) AS ${RATING_MOYEN}
        FROM ${RECETTE_TABLE} r
        LEFT JOIN ${ETAPE_TABLE} e ON r.${RECETTE_ID} = e.${RECETTE_ID}
        LEFT JOIN ${INGREDIENT_TABLE} i ON r.${RECETTE_ID} = i.${RECETTE_ID}
        LEFT JOIN ${UNITE_MESURE_TABLE} u ON i.${UNITE_KEY} = u.${UNITE_KEY}
        LEFT JOIN ${APPRECIATION_TABLE} a ON r.${RECETTE_ID} = a.${RECETTE_ID}
        WHERE r.${RECETTE_ID} = $1
        GROUP BY r.${RECETTE_ID}, e.${ETAPE_KEY}, i.${INGREDIENT_KEY}, u.${UNITE_KEY}
        ORDER BY r.${RECETTE_ID}, e.${ORDRE}, i.${ORDRE}`,
        [recetteId]
    );

    const rows = result.rows;
    if (rows.length === 0) return undefined;

    const recettesDetaillees = [];
    let recetteCourante = null;
    let etapeCourante = null;
    let ingredientCourant = null;

    result.rows.forEach(row => {
        if (!recetteCourante || recetteCourante.recetteId !== row[RECETTE_ID]) {
            recetteCourante = createRecetteFromRow(row);
            recettesDetaillees.push(recetteCourante);
        }

        if (row[ETAPE_KEY] && !recetteCourante.etapes.some(etape => etape.etapeKey === row[ETAPE_KEY])) {
            etapeCourante = createEtapeFromRow(row);
            recetteCourante.etapes.push(etapeCourante);
        }

        if (row[INGREDIENT_KEY] && !recetteCourante.ingredients.some(ingredient => ingredient.ingredientKey === row[INGREDIENT_KEY])) {
            ingredientCourant = createIngredientFromRow(row);
            recetteCourante.ingredients.push(ingredientCourant);
        }
    });

    result = await pool.query(
        `SELECT c.${COMMENTAIRE_KEY}, c.${COMMENTAIRE}, c.${DATE_HEURE},
        ua.${USER_ID}, ua.${USER_FULL_NAME}
        FROM ${COMMENTAIRE_TABLE} c
        JOIN ${USER_ACCOUNT_TABLE} ua ON c.${USER_ID} = ua.${USER_ID}
        WHERE c.${RECETTE_ID} = $1`,
        [recetteId]
    );

    recettesDetaillees[0].commentaires = result.rows;

    return recettesDetaillees;
};
exports.getRecetteById = getRecetteById;


/**
 * Fonction permettant d'obtenir le contenu binaire de la colonne image_content et son type
 * (colonne image_content_type). Utilisé par un endpoint qui offre le téléchargement d'une image
 * de produit stockée dans la table product de la BD.
 * 
 * @param {string} recetteId 
 * @returns Promesse pour un objet avec deux propriétés :
 *          imageContent : un Buffer avec le contenu binaire de l'image
 *          imageContentType : une chaîne de caractères avec le Content-Type de l'image (p.ex. "image/jpeg")
 */
const getRecetteImageContent = async (recetteId) => {
    const result = await pool.query(
        `SELECT ${IMAGE_CONTENT}, ${IMAGE_CONTENT_TYPE} FROM ${RECETTE_TABLE} WHERE ${RECETTE_ID} = $1`,
        [recetteId]
    );

    const row = result.rows[0];
    if (row) {
        return {
            imageContent: row.image_content,
            imageContentType: row.image_content_type
        };
    }

    return undefined;
};
exports.getRecetteImageContent = getRecetteImageContent;


const insertRecette = async (recette, ingredients, etapes) => {

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            `INSERT INTO ${RECETTE_TABLE} (${RECETTE_ID}, ${NOM_RECETTE}, ${DESCRIPTION}, ${TEMPS_PREPARATION_MINUTES}, ${TEMPS_CUISSON_MINUTES}, ${NB_PORTIONS}) 
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [recette.recetteId, recette.nomRecette, recette.descriptionRecette, recette.tempsPreparationMinutes, recette.tempsCuissonMinutes, recette.nbPortions]
        );

        if (ingredients) {
            //une for of car foreach ne gere pas bien promesse async
            for (const ingredient of ingredients) {

                const uniteKeyQuery = `SELECT ${UNITE_KEY} FROM ${UNITE_MESURE_TABLE} WHERE ${TYPE_UNITE} = $1`;
                const uniteKeyResult = await client.query(uniteKeyQuery, [ingredient.typeUnite]);

                if (ingredient.typeUnite !== 'undefined' && !uniteKeyResult.rows.length > 0 && ingredient.typeUnite !== 'null' && ingredient.typeUnite !== '') {
                    throw new HttpError(500, `Le type ${ingredient.typeUnite} est introuvable`); //permet de l'afficher au client
                    // throw new Error("Le type d'unité n'existe pas");
                }

                const uniteKey = uniteKeyResult.rows.length > 0 ? uniteKeyResult.rows[0].unite_key : null;
                const insertQuery = `INSERT INTO ${INGREDIENT_TABLE} (${RECETTE_ID}, ${UNITE_KEY}, ${NOM_INGREDIENT}, ${ORDRE}, ${QUANTITE}) 
                                        VALUES ($1, $2, $3, $4, $5)`;
                await client.query(insertQuery, [recette.recetteId, uniteKey, ingredient.nomIngredient, ingredient.ordreIngredient, ingredient.quantite]);
            }
        }

        if (etapes) {
            //une for of car foreach ne gere pas bien promesse async
            for (const etape of etapes) {
                await client.query(
                    `INSERT INTO ${ETAPE_TABLE} (${RECETTE_ID}, ${DESCRIPTION}, ${ORDRE}) 
                    VALUES ($1, $2, $3)`,
                    [recette.recetteId, etape.descriptionEtape, etape.ordreEtape]
                );
            }
        }

        await client.query("COMMIT");
        return getRecetteById(recette.recetteId);
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};
exports.insertRecette = insertRecette;


const updateRecette = async (recette, ingredients, etapes) => {

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE ${RECETTE_TABLE} SET ${NOM_RECETTE} = $2, ${DESCRIPTION} = $3, ${TEMPS_PREPARATION_MINUTES} = $4, ${TEMPS_CUISSON_MINUTES} = $5, ${NB_PORTIONS} = $6 
            WHERE ${RECETTE_ID} = $1`,
            [recette.recetteId, recette.nomRecette, recette.descriptionRecette, recette.tempsPreparationMinutes, recette.tempsCuissonMinutes, recette.nbPortions]
        );

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            return undefined;
        }

        await client.query(
            `DELETE FROM ${INGREDIENT_TABLE} WHERE ${RECETTE_ID} = $1`,
            [recette.recetteId]
        );

        if (ingredients) {
            //une for of car foreach ne gere pas bien promesse async
            for (const ingredient of ingredients) {

                const uniteKeyQuery = `SELECT ${UNITE_KEY} FROM ${UNITE_MESURE_TABLE} WHERE ${TYPE_UNITE} = $1`;
                const uniteKeyResult = await client.query(uniteKeyQuery, [ingredient.typeUnite]);

                if (ingredient.typeUnite !== 'undefined' && !uniteKeyResult.rows.length > 0 && ingredient.typeUnite !== 'null' && ingredient.typeUnite !== '') {
                    throw new HttpError(500, `Le type ${ingredient.typeUnite} est introuvable`); //permet de l'afficher au client
                    // throw new Error("Le type d'unité n'existe pas");
                }

                const uniteKey = uniteKeyResult.rows.length > 0 ? uniteKeyResult.rows[0].unite_key : null;
                const insertQuery = `INSERT INTO ${INGREDIENT_TABLE} (${RECETTE_ID}, ${UNITE_KEY}, ${NOM_INGREDIENT}, ${ORDRE}, ${QUANTITE}) 
                                        VALUES ($1, $2, $3, $4, $5)`;
                await client.query(insertQuery, [recette.recetteId, uniteKey, ingredient.nomIngredient, ingredient.ordreIngredient, ingredient.quantite]);
            }
        }

        await client.query(
            `DELETE FROM ${ETAPE_TABLE} WHERE ${RECETTE_ID} = $1`,
            [recette.recetteId]
        );

        if (etapes) {
            //une for of car foreach ne gere pas bien promesse async
            for (const etape of etapes) {
                await client.query(
                    `INSERT INTO ${ETAPE_TABLE} (${RECETTE_ID}, ${DESCRIPTION}, ${ORDRE}) 
                    VALUES ($1, $2, $3)`,
                    [recette.recetteId, etape.descriptionEtape, etape.ordreEtape]
                );
            }
        }

        await client.query("COMMIT");
        return getRecetteById(recette.recetteId);
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
};
exports.updateRecette = updateRecette;


const deleteRecette = async (recetteId) => {
    const result = await pool.query(
        `DELETE FROM ${RECETTE_TABLE} WHERE ${RECETTE_ID} = $1`,
        [recetteId]
    );

    if (result.rowCount === 0) {
        return undefined;
    }

    return {};
};
exports.deleteRecette = deleteRecette;


const updateRecetteImage = async (recetteId, imageBuffer, imageContentType) => {
    const result = await pool.query(
        `UPDATE ${RECETTE_TABLE} SET ${IMAGE_CONTENT} = $2, ${IMAGE_CONTENT_TYPE} = $3
        WHERE ${RECETTE_ID} = $1`,
        [recetteId, imageBuffer, imageContentType]
    );

    if (result.rowCount === 0) {
        throw new HttpError(500, "Erreur lors de la mise-à-jour de l'image");
    }

    return getRecetteImageContent(recetteId);
};
exports.updateRecetteImage = updateRecetteImage;

const insertRating = async (recetteId, userId, rating) => {
    const result = await pool.query(
        `INSERT INTO ${APPRECIATION_TABLE} (${USER_ID}, ${RECETTE_ID}, ${RATING})
        VALUES ($1, $2, $3)`,
        [userId, recetteId, rating]
    );

    if (result.rowCount === 0) {
        throw new HttpError(500, "Erreur lors de l'insertion de l'évaluation");
    }

    return {};
};
exports.insertRating = insertRating;

const updateRating = async (recetteId, userId, rating) => {
    const result = await pool.query(
        `UPDATE ${APPRECIATION_TABLE} SET ${RATING} = $3
        WHERE ${RECETTE_ID} = $1 AND ${USER_ID} = $2`,
        [recetteId, userId, rating]
    );

    if (result.rowCount === 0) {
        throw new HttpError(500, "Erreur lors de la mise-à-jour de l'évaluation");
    }

    return {};
};
exports.updateRating = updateRating;

const insertComment = async (recetteId, userId, comment) => {
    const result = await pool.query(
        `INSERT INTO ${COMMENTAIRE_TABLE} (${USER_ID}, ${RECETTE_ID}, ${COMMENTAIRE}, ${DATE_HEURE})
        VALUES ($1, $2, $3, timezone('America/New_York', now())::timestamp(0))`,
        [userId, recetteId, comment]
    );

    if (result.rowCount === 0) {
        throw new HttpError(500, "Erreur lors de l'insertion du commentaire");
    }

    return {};
}
exports.insertComment = insertComment;

const getAllCommentsByRecipe = async (recetteId) => {
    const result = await pool.query(
        `SELECT c.${COMMENTAIRE_KEY}, c.${COMMENTAIRE}, c.${DATE_HEURE},
        ua.${USER_ID}, ua.${USER_FULL_NAME}
        FROM ${COMMENTAIRE_TABLE} c
        JOIN ${USER_ACCOUNT_TABLE} ua ON c.${USER_ID} = ua.${USER_ID}
        WHERE c.${RECETTE_ID} = $1`,
        [recetteId]
    );

    const commentaires = [];
    result.rows.forEach(commentaire => {
        commentaires.push(
            {
                commentaireKey: commentaire[COMMENTAIRE_KEY],
                commentaire: commentaire[COMMENTAIRE],
                dateHeure: commentaire[DATE_HEURE],
                userId: commentaire[USER_ID],
                userFullName: commentaire[USER_FULL_NAME]
            }
        );
    });

    return commentaires;
};
exports.getAllCommentsByRecipe = getAllCommentsByRecipe;

function createRecetteFromRow(row) {
    return {
        recetteId: row[RECETTE_ID],
        nomRecette: row[NOM_RECETTE],
        descriptionRecette: row[DESCRIPTION_RECETTE],
        tempsPreparationMinutes: row[TEMPS_PREPARATION_MINUTES],
        tempsCuissonMinutes: row[TEMPS_CUISSON_MINUTES],
        nbPortions: row[NB_PORTIONS],
        ratingMoyen: row[RATING_MOYEN] === null ? null : Number(row[RATING_MOYEN]),
        image: getImagePathForRecetteId(row[RECETTE_ID]),
        etapes: [],
        ingredients: [],
    };
}

function createEtapeFromRow(row) {
    return {
        etapeKey: row[ETAPE_KEY],
        descriptionEtape: row[DESCRIPTION_ETAPE],
        ordreEtape: row[ORDRE_ETAPE]
    };
}

function createIngredientFromRow(row) {
    return {
        ingredientKey: row[INGREDIENT_KEY],
        nomIngredient: row[NOM_INGREDIENT],
        ordreIngredient: row[ORDRE_INGREDIENT],
        quantite: row[QUANTITE],
        typeUnite: row[TYPE_UNITE]
    };
}
