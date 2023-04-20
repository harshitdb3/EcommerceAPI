const { DataTypes } = require('sequelize');
const sequelize= require('../config/sequelize');
const Product = require('./Product');
const User = require('./User');


const UserCart = sequelize.define
('UserCart', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

User.belongsToMany(Product, { through: UserCart });
Product.belongsToMany(User, { through: UserCart });

module.exports = UserCart;