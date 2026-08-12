module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    'Permission',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      resource: { type: DataTypes.STRING, allowNull: false },
      action: {
        type: DataTypes.ENUM('create', 'read', 'update', 'delete'),
        allowNull: false,
      },
    },
    {
      tableName: 'permissions',
      timestamps: false,
      indexes: [{ unique: true, fields: ['resource', 'action'] }],
    },
  );

  Permission.associate = (models) => {
    Permission.belongsToMany(models.Department, {
      through: models.DepartmentDefaultPermission,
      foreignKey: 'permission_id',
      otherKey: 'department_id',
    });
    Permission.belongsToMany(models.User, {
      through: models.UserPermission,
      foreignKey: 'permission_id',
      otherKey: 'user_id',
    });
    Permission.hasMany(models.DepartmentDefaultPermission, { foreignKey: 'permission_id' });
    Permission.hasMany(models.UserPermission, { foreignKey: 'permission_id' });
  };

  return Permission;
};
