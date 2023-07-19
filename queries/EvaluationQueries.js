const pool = require('./DBPool');

const getAverageRating = async (recetteId) => {
    const result = await pool.query(
        `SELECT ROUND(AVG(a.rating),1) AS rating_moyen
        FROM appreciation a
        INNER JOIN recette r ON r.recette_id = a.recette_id
        WHERE a.recette_id = $1`,
        [recetteId]
    );

    const ratingMoyen = {
        ratingMoyen: result.rows[0].rating_moyen
    }

    return ratingMoyen;
};
exports.getAverageRating = getAverageRating;

const getRatingByIds = async (recetteId, userId) => {
    const result = await pool.query(
        `SELECT * FROM appreciation
        WHERE recette_id = $1 AND user_id = $2`,
        [recetteId, userId]
    );
    
    if(result.rowCount === 0) return undefined;

    return result.rows[0];
};
exports.getRatingByIds = getRatingByIds;