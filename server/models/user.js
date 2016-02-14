'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    fb_id: {type: DataTypes.STRING, unique: true},
    name: DataTypes.STRING,
    profile_picture_url: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Prototype, { foreignKey: 'fb_id'})
      }
    }
  });
  return User;
};