'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('clients', [
      { id: 1, company_name: 'Acme Sportswear', created_at: new Date() },
      { id: 2, company_name: 'Nova Skincare', created_at: new Date() },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('clients', null);
  },
};
