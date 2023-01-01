let db = require('./database');

/* CRUD functions: readTable, createRow, updateRow, deleteRow */

var schema = {
    "Files": ['File_No', 'Item_Des', 'Dra_No', 'Dra_Iss', 'Jig_Sts']
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

function readGigTable(table) {
    return new Promise((resolve) => {
        let sql = `SELECT * FROM ${table} ORDER BY ind ASC`;
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

function saveRow(obj) {
    return new Promise((resolve) => {
        const sql = `UPDATE Files SET saved=?, len=?, md=?, mark=?, turn=?, adj=?, kk=? WHERE File_No=?`;
        db.run(sql, [obj.saved, obj.len, obj.md, obj.mark, obj.turn, obj.adj, obj.kk, obj.tblName], function (err){
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

function createTbl(table) {
    return new Promise((resolve) => {
        let sql = `
            CREATE TABLE ${table} (
                ind int NOT NULL,
                clr varchar(255) NOT NULL,
                gap int NOT NULL,
                PRIMARY KEY (ind)
            );
        `;
        db.run(sql, (error) => {
            if (error) {
              console.error(error.message);
            }
            console.log('Table created successfully');
            resolve();
        });
    });
};

function addTbl(table, data) {
    return new Promise((resolve) => {
        const sql = `INSERT INTO ${table} (ind, clr, gap) VALUES (?, ?, ?)`;
        db.run(sql, [data[0], data[1], data[2]], function(error) {
            if (error) {
                console.error(error.message);
            }
            resolve();
        });
    });
}

function getSavedFiles() {
    return new Promise((resolve) => {
        let sql = `SELECT * FROM Files WHERE saved = 1`;
        db.all(sql, function (err, rows) {
            if (err) throw (err);
            resolve(rows);
        });
    });
}

module.exports = {
    readTable,
    createRow,
    updateRow,
    deleteRow,
    createTbl,
    addTbl,
    saveRow,
    getSavedFiles,
    readGigTable
}