'use strict';
module.exports = function(sequelize, DataTypes) {
  var Prototype = sequelize.define('Prototype', {
    fb_id: {type: DataTypes.STRING, unique: true},
    url: DataTypes.STRING,
    creator_name: DataTypes.STRING,
    creator_fb_id: DataTypes.STRING,
    likes: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    created_time: DataTypes.DATE,
    updated_time: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Prototype;
};