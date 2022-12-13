/* mysql */
// const mysql = require('mysql2');
// const db = mysql.createConnection({
//     host:'localhost',
//     user:'root',
//     password:'ShaN@19960930',
//     database:'electrondb'
// });
// module.exports = db

//////////////////////////////////////////////////
/* sqllite */
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(path.join(__dirname, '../database/main.db'));
module.exports = db
