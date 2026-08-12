const ApiError = require('../utils/ApiError');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password_hash: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM('superadmin', 'manager', 'employee', 'client'),
        allowNull: false,
      },
      department_id: { type: DataTypes.INTEGER, allowNull: true },
      manager_id: { type: DataTypes.INTEGER, allowNull: true },
      client_id: { type: DataTypes.INTEGER, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'users',
      createdAt: 'created_at',
      updatedAt: false,
      paranoid: true,
      deletedAt: 'deleted_at',
      defaultScope: {
        attributes: { exclude: ['password_hash'] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ['password_hash'] },
        },
      },
      hooks: {
        beforeValidate: (user) => {
          if (['manager', 'employee'].includes(user.role) && !user.department_id) {
            throw new ApiError(400, `${user.role} users must have a department_id`);
          }
          if (user.role === 'employee' && !user.manager_id) {
            throw new ApiError(400, 'employee users must have a manager_id');
          }
          if (user.role === 'client' && !user.client_id) {
            throw new ApiError(400, 'client users must have a client_id');
          }
        },
      },
    },
  );

  User.associate = (models) => {
    User.belongsTo(models.Department, { foreignKey: 'department_id' });
    User.belongsTo(models.User, { as: 'manager', foreignKey: 'manager_id' });
    User.hasMany(models.User, { as: 'employees', foreignKey: 'manager_id' });
    User.belongsTo(models.Client, { foreignKey: 'client_id' });
    User.hasMany(models.ClientAssignment, { foreignKey: 'manager_id' });
    User.belongsToMany(models.Permission, {
      through: models.UserPermission,
      foreignKey: 'user_id',
      otherKey: 'permission_id',
    });
    User.hasMany(models.Task, { as: 'assignedTasks', foreignKey: 'assigned_to' });
    User.hasMany(models.RefreshToken, { foreignKey: 'user_id' });
    User.hasMany(models.AuditLog, { foreignKey: 'user_id' });
  };

  return User;
};
