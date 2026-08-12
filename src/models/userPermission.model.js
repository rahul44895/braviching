module.exports = (sequelize, DataTypes) => {
  const UserPermission = sequelize.define(
    'UserPermission',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      permission_id: { type: DataTypes.INTEGER, allowNull: false },
      granted_by: { type: DataTypes.INTEGER, allowNull: false },
      // 'grant' adds this permission beyond department defaults; 'revoke' subtracts it from what
      // department defaults would otherwise give this specific user. Never both for the same
      // (user_id, permission_id) at once -- see the unique index below.
      type: { type: DataTypes.ENUM('grant', 'revoke'), allowNull: false, defaultValue: 'grant' },
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
