'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('department_default_permissions', {
      department_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'departments', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      permission_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'permissions', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('department_default_permissions');
  },
};
