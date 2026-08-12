module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      action: { type: DataTypes.STRING, allowNull: false },
      resource: { type: DataTypes.STRING, allowNull: false },
      resource_id: { type: DataTypes.INTEGER, allowNull: true },
      timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'audit_logs',
      timestamps: false,
      indexes: [{ fields: ['user_id'] }],
    },
  );

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return AuditLog;
};
