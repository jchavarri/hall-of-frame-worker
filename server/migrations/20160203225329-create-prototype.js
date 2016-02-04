'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Prototypes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fb_id: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      creator_name: {
        type: Sequelize.STRING
      },
      creator_fb_id: {
        type: Sequelize.STRING
      },
      likes: {
        type: Sequelize.INTEGER
      },
      message: {
        type: Sequelize.TEXT
      },
      created_time: {
        type: Sequelize.DATE
      },
      updated_time: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Prototypes');
  }
};