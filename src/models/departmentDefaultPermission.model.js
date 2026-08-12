module.exports = (sequelize, DataTypes) => {
  const DepartmentDefaultPermission = sequelize.define(
    'DepartmentDefaultPermission',
    {
      department_id: { type: DataTypes.INTEGER, primaryKey: true },
      permission_id: { type: DataTypes.INTEGER, primaryKey: true },
    },
    {
      tableName: 'department_default_permissions',
      timestamps: false,
    },
  );

  DepartmentDefaultPermission.associate = (models) => {
    DepartmentDefaultPermission.belongsTo(models.Department, { foreignKey: 'department_id' });
    DepartmentDefaultPermission.belongsTo(models.Permission, { foreignKey: 'permission_id' });
  };

  return DepartmentDefaultPermission;
};
