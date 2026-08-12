module.exports = (sequelize, DataTypes) => {
  const ClientAssignment = sequelize.define(
    'ClientAssignment',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      manager_id: { type: DataTypes.INTEGER, allowNull: false },
      client_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: 'client_assignments',
      createdAt: 'created_at',
      updatedAt: false,
      paranoid: true,
      deletedAt: 'deleted_at',
      indexes: [{ unique: true, fields: ['manager_id', 'client_id'] }, { fields: ['manager_id'] }],
    },
  );

  ClientAssignment.associate = (models) => {
    ClientAssignment.belongsTo(models.User, { as: 'manager', foreignKey: 'manager_id' });
    ClientAssignment.belongsTo(models.Client, { foreignKey: 'client_id' });
  };

  return ClientAssignment;
};
