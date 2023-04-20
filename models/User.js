const {DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');


const User = sequelize.define('User',{
  id: {
    type: DataTypes.UUID,
    defaultValue:DataTypes.UUIDV4 ,
    primaryKey: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
});

module.exports = User;




