let db = require('./database');

/* CRUD functions: readTable, createRow, updateRow, deleteRow */

var schema = {
    "Files": ['File_No', 'Item_Des', 'Dra_No', 'Dra_Iss', 'Jig_Sts'],
    "tmpjig": ['ind', 'clr', 'gap']
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

function createRow(table, obj) {
    return new Promise((resolve) => {
        var pairs = "";
        for (const key in obj) {
            if (pairs) pairs += ", ";
            pairs += `'${obj[key]}'`;
        };
        let sql = `INSERT INTO ${table} (${schema[table].toString()}) VALUES (${pairs})`;
        db.run(sql, function (err) {
            if (err) resolve(err);
            resolve();
        });
    });
};

function updateRow(table, obj) {
    return new Promise((resolve) => {
        const sql = `UPDATE ${table} SET Item_Des=?, Dra_No=?, Dra_Iss=? WHERE File_No=?`;
        db.run(sql, [obj.Item_Des, obj.Dra_No, obj.Dra_Iss, obj.File_No], function (err){
            if (err) resolve(err);
            resolve();
        });
    });
};

function deleteRow(table, obj) {
    return new Promise((resolve) => {
        let sql = `DELETE FROM ${table} WHERE File_No = "${obj.File_No}"`;
        db.run(sql, function (err){
            if (err) console.log(err);;
            resolve();
        });
    });
};

module.exports = {
    readTable,
    createRow,
    updateRow,
    deleteRow
}