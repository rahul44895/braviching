'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('client_assignments', [
      { manager_id: 2, client_id: 1, created_at: new Date() }, // manager1 -> Acme Sportswear
      { manager_id: 4, client_id: 2, created_at: new Date() }, // manager2 -> Nova Skincare
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('client_assignments', null);
  },
};
