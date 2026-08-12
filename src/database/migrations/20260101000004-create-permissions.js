'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('permissions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      resource: { type: Sequelize.STRING, allowNull: false },
      action: {
        type: Sequelize.ENUM('create', 'read', 'update', 'delete'),
        allowNull: false,
      },
    });

    await queryInterface.addIndex('permissions', ['resource', 'action'], { unique: true });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('permissions');
  },
};
