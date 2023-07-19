const pool = require('./DBPool');

const getAllUnites = async () => {
    const result = await pool.query(
        `SELECT * FROM unite_mesure`
    );

    const typesUnite = [];
    result.rows.forEach(unite => {
        typesUnite.push(
            {
                uniteKey: unite.unite_key,
                typeUnite: unite.type_unite
            }
        );
    });

    return typesUnite;
};
exports.getAllUnites = getAllUnites;