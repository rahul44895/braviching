'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('campaigns', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'clients', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      channel: {
        type: Sequelize.ENUM('google', 'meta', 'tiktok', 'email'),
        allowNull: false,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      budget: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'active' },
      start_date: { type: Sequelize.DATEONLY, allowNull: true },
      end_date: { type: Sequelize.DATEONLY, allowNull: true },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('campaigns', ['client_id']);
    await queryInterface.addIndex('campaigns', ['client_id', 'status']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('campaigns');
  },
};
