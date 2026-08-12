'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      action: { type: Sequelize.STRING, allowNull: false },
      resource: { type: Sequelize.STRING, allowNull: false },
      resource_id: { type: Sequelize.INTEGER, allowNull: true },
      timestamp: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.addIndex('audit_logs', ['user_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('audit_logs');
  },
};
