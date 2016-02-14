'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
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
      name: {
        type: Sequelize.STRING
      },
      profile_picture_url:  {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
    .then(function() {
      queryInterface.removeColumn(
        'Prototypes',
        'creator_name'
      )
    })
    .then(function() {
      queryInterface.changeColumn('Prototypes', 'creator_fb_id', {
        type: Sequelize.STRING,
        references: {
          model: 'Users',
          key: 'fb_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      })
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Prototypes', 'creator_fb_id')
    .then(function() {
      queryInterface.addColumn('Prototypes', 'creator_fb_id', {
        type: Sequelize.STRING
      })
    })
    .then(function() {
      queryInterface.dropTable('Users')
    })
    .then(function() {
      queryInterface.addColumn(
        'Prototypes',
        'creator_name',
        {
          type: Sequelize.STRING
        }
      )
    })
  }
};
