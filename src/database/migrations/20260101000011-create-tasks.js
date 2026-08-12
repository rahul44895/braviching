'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tasks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'clients', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      category: {
        type: Sequelize.ENUM('marketplace', 'paid_media', 'email', 'storefront'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'done'),
        allowNull: false,
        defaultValue: 'open',
      },
      due_date: { type: Sequelize.DATEONLY, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('tasks', ['client_id']);
    await queryInterface.addIndex('tasks', ['assigned_to']);
    await queryInterface.addIndex('tasks', ['client_id', 'status']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('tasks');
  },
};
