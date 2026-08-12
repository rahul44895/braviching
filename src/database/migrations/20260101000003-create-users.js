'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      role: {
        type: Sequelize.ENUM('superadmin', 'manager', 'employee', 'client'),
        allowNull: false,
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'departments', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      manager_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'clients', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('users', ['department_id']);
    await queryInterface.addIndex('users', ['manager_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};
