module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define(
    'Department',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    {
      tableName: 'departments',
      timestamps: false,
    },
  );

  Department.associate = (models) => {
    Department.hasMany(models.User, { foreignKey: 'department_id' });
    Department.belongsToMany(models.Permission, {
      through: models.DepartmentDefaultPermission,
      foreignKey: 'department_id',
      otherKey: 'permission_id',
    });
    Department.hasMany(models.DepartmentDefaultPermission, { foreignKey: 'department_id' });
  };

  return Department;
};
