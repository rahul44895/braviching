'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    const password_hash = bcrypt.hashSync('Password123!', 10);
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        name: 'Sasha Superadmin',
        email: 'superadmin@example.com',
        password_hash,
        role: 'superadmin',
        department_id: null,
        manager_id: null,
        client_id: null,
        is_active: true,
        created_at: now,
      },
      {
        id: 2,
        name: 'Morgan Manager (Paid Media)',
        email: 'manager1@example.com',
        password_hash,
        role: 'manager',
        department_id: 2,
        manager_id: null,
        client_id: null,
        is_active: true,
        created_at: now,
      },
      {
        id: 3,
        name: 'Erin Employee (Paid Media)',
        email: 'employee1@example.com',
        password_hash,
        role: 'employee',
        department_id: 2,
        manager_id: 2,
        client_id: null,
        is_active: true,
        created_at: now,
      },
      {
        id: 4,
        name: 'Mika Manager (Storefront Craft)',
        email: 'manager2@example.com',
        password_hash,
        role: 'manager',
        department_id: 4,
        manager_id: null,
        client_id: null,
        is_active: true,
        created_at: now,
      },
      {
        id: 5,
        name: 'Evan Employee (Storefront Craft)',
        email: 'employee2@example.com',
        password_hash,
        role: 'employee',
        department_id: 4,
        manager_id: 4,
        client_id: null,
        is_active: true,
        created_at: now,
      },
      {
        id: 6,
        name: 'Acme Sportswear Client Login',
        email: 'client1@example.com',
        password_hash,
        role: 'client',
        department_id: null,
        manager_id: null,
        client_id: 1,
        is_active: true,
        created_at: now,
      },
      {
        id: 7,
        name: 'Nova Skincare Client Login',
        email: 'client2@example.com',
        password_hash,
        role: 'client',
        department_id: null,
        manager_id: null,
        client_id: 2,
        is_active: true,
        created_at: now,
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null);
  },
};
