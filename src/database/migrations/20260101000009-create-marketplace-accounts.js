'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('marketplace_accounts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'clients', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      platform: {
        type: Sequelize.ENUM('amazon', 'ebay', 'walmart', 'shopify'),
        allowNull: false,
      },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('marketplace_accounts', ['client_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('marketplace_accounts');
  },
};
