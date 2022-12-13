let db = require('./database');

/* CRUD functions: readTable, createRow, updateRow, deleteRow             */

var schema = {
    "items": ["id", "name", "unit", "price", "qty", "desc"],
    "announce": ["id", "title", "date", "body"],
    "events": ["id", "title", "date", "body"],
    "motd": ["id", "title", "body"]
};

function readTable(table) {
    return new Promise((resolve) => {
        let sql = `SELECT * FROM ${table}`;
        db.all(sql, function (err, rows) {
            if (err) throw (err);
            resolve(rows);
        });
    });
};

function createRow(table, cb) {
    let sql = `INSERT INTO ${table} DEFAULT VALUES`;
    db.run(sql, cb);
};

function updateRow(table, rb, cb) {
    var pairs = "";           /* for constructing 'identifier = value, ...' */
    for (field of schema[table].slice(1)) {   /* for every column except id */
        if (pairs) pairs += ", ";    /* insert comma unless string is empty */
        pairs += `${field} = '${escape(rb[field])}'`;   /* column = 'value' */
    }
    let sql = `UPDATE ${table} SET ${pairs} WHERE id = ?`;  /* ? = rb['id'] */
    db.run(sql, rb['id'], cb);
};

function deleteRow(table, id, cb) {
    let sql = `DELETE FROM ${table} WHERE id = ${id};`;
    db.run(sql, cb);
};

module.exports = {
    readTable,
    createRow,
    updateRow,
    deleteRow
}