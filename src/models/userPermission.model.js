module.exports = (sequelize, DataTypes) => {
  const UserPermission = sequelize.define(
    'UserPermission',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      permission_id: { type: DataTypes.INTEGER, allowNull: false },
      granted_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: 'user_permissions',
      createdAt: 'granted_at',
      updatedAt: false,
      paranoid: true,
      deletedAt: 'deleted_at',
      indexes: [{ unique: true, fields: ['user_id', 'permission_id'] }],
    },
  );

  UserPermission.associate = (models) => {
    UserPermission.belongsTo(models.User, { foreignKey: 'user_id' });
    UserPermission.belongsTo(models.Permission, { foreignKey: 'permission_id' });
    UserPermission.belongsTo(models.User, { as: 'granter', foreignKey: 'granted_by' });
  };

  return UserPermission;
};
