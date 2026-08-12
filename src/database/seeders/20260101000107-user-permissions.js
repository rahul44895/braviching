'use strict';

// permission 20 = task:delete, permission 13 = campaign:create (see 20260101000102-permissions.js)

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    await queryInterface.bulkInsert('user_permissions', [
      // manager1 (paid_media) gets task:delete beyond their department default, granted by superadmin.
      { user_id: 2, permission_id: 20, granted_by: 1, granted_at: now },
      // employee1 gets task:delete granted by their own manager (manager1) -- demonstrates
      // Manager->Employee delegation using the same canGrantPermission check: manager1 can only
      // grant this because they hold task:delete themselves via the grant above.
      { user_id: 3, permission_id: 20, granted_by: 2, granted_at: now },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('user_permissions', null);
  },
};
