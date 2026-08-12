const { Department } = require('../../models');
const recordAudit = require('../../utils/recordAudit');

async function list() {
  return Department.findAll({ order: [['id', 'ASC']] });
}

async function create(user, data) {
  const department = await Department.create(data);
  await recordAudit(user.id, 'department:create', 'department', department.id);
  return department;
}

module.exports = { list, create };
