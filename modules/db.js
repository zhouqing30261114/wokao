var mysql = require('mysql');
var dbConfig = require('../db-config');
module.exports = mysql.createPool(dbConfig);