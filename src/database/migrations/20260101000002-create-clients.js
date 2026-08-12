'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('clients', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      company_name: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('clients');
  },
};
