'use strict';

// Implements the type ENUM('grant','revoke') extension the original spec explicitly anticipated
// (see user_permissions' own documentation comment) -- lets a specific (user, permission) row
// either add to department defaults ('grant') or subtract from them ('revoke'). Existing rows
// (manager1/employee1's seeded task:delete grants) become 'grant' automatically via the default.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_permissions', 'type', {
      type: Sequelize.ENUM('grant', 'revoke'),
      allowNull: false,
      defaultValue: 'grant',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('user_permissions', 'type');
  },
};
