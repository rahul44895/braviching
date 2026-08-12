'use strict';

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    await queryInterface.bulkInsert('campaigns', [
      {
        client_id: 1,
        channel: 'google',
        name: 'Acme Sportswear - Spring Google Ads',
        budget: 5000.0,
        status: 'active',
        start_date: '2026-03-01',
        end_date: '2026-05-31',
      },
      {
        client_id: 2,
        channel: 'email',
        name: 'Nova Skincare - Abandoned Cart Flow',
        budget: 1200.0,
        status: 'active',
        start_date: '2026-02-01',
        end_date: null,
      },
    ]);

    await queryInterface.bulkInsert('tasks', [
      {
        client_id: 1,
        assigned_to: 3, // employee1
        title: 'Launch Google Ads campaign for Acme',
        description: 'Set up ad groups and creative for the spring campaign.',
        category: 'paid_media',
        status: 'open',
        due_date: '2026-03-15',
        created_at: now,
      },
      {
        client_id: 2,
        assigned_to: 5, // employee2
        title: 'Audit Shopify storefront for Nova Skincare',
        description: 'Review checkout flow and product page load times.',
        category: 'storefront',
        status: 'in_progress',
        due_date: '2026-08-20',
        created_at: now,
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('tasks', null);
    await queryInterface.bulkDelete('campaigns', null);
  },
};
