'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('client_assignments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      manager_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'clients', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('client_assignments', ['manager_id', 'client_id'], {
      unique: true,
    });
    await queryInterface.addIndex('client_assignments', ['manager_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('client_assignments');
  },
};
