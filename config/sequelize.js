require('dotenv').config();

const {PGHOST,PGUSER,PGPASSWORD,PGDATABASE } = process.env;

const Sequelize = require('sequelize');

const sequelize = new Sequelize(PGDATABASE, PGUSER,PGPASSWORD, {
  host: PGHOST,
  dialect: 'postgres'
});

module.exports = sequelize;