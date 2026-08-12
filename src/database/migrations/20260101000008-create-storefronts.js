'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('storefronts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'clients', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      platform: {
        type: Sequelize.ENUM('shopify', 'amazon', 'magento', 'headless'),
        allowNull: false,
      },
      url: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('storefronts', ['client_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('storefronts');
  },
};
