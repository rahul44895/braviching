'use strict';

// Permission ids (see 20260101000102-permissions.js for the full 1-20 layout):
// client: 1 create, 2 read, 3 update, 4 delete
// storefront: 5 create, 6 read, 7 update, 8 delete
// marketplace_account: 9 create, 10 read, 11 update, 12 delete
// campaign: 13 create, 14 read, 15 update, 16 delete
// task: 17 create, 18 read, 19 update, 20 delete

module.exports = {
  up: async (queryInterface) => {
    const defaults = {
      1: [2, 9, 10, 11, 12, 17, 18, 19], // marketplace_ops: client:read, marketplace_account CRUD, task create/read/update
      2: [2, 13, 14, 15, 16, 17, 18, 19], // paid_media: client:read, campaign CRUD, task create/read/update
      3: [2, 13, 14, 15, 17, 18, 19], // email_retention: client:read, campaign create/read/update, task create/read/update
      4: [2, 5, 6, 7, 8, 17, 18, 19], // storefront_craft: client:read, storefront CRUD, task create/read/update
    };

    const rows = [];
    for (const [department_id, permission_ids] of Object.entries(defaults)) {
      for (const permission_id of permission_ids) {
        rows.push({ department_id: Number(department_id), permission_id });
      }
    }
    await queryInterface.bulkInsert('department_default_permissions', rows);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('department_default_permissions', null);
  },
};
