'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('departments', [
      { id: 1, name: 'marketplace_ops' },
      { id: 2, name: 'paid_media' },
      { id: 3, name: 'email_retention' },
      { id: 4, name: 'storefront_craft' },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('departments', null);
  },
};
