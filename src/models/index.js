const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database.config');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: false,
});

const db = {};

fs.readdirSync(__dirname)
  .filter((file) => file !== path.basename(__filename) && file.endsWith('.model.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
