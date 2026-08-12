'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('departments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('departments');
  },
};
