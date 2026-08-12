'use strict';

const RESOURCES = ['client', 'storefront', 'marketplace_account', 'campaign', 'task'];
const ACTIONS = ['create', 'read', 'update', 'delete'];

module.exports = {
  up: async (queryInterface) => {
    let id = 1;
    const rows = [];
    for (const resource of RESOURCES) {
      for (const action of ACTIONS) {
        rows.push({ id: id++, resource, action });
      }
    }
    await queryInterface.bulkInsert('permissions', rows);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('permissions', null);
  },
};
