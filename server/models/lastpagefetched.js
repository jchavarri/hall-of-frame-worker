'use strict';
module.exports = function(sequelize, DataTypes) {
  var LastPageFetched = sequelize.define('LastPageFetched', {
    url: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return LastPageFetched;
};