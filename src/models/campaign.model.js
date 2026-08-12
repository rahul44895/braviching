module.exports = (sequelize, DataTypes) => {
  const Campaign = sequelize.define(
    'Campaign',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      client_id: { type: DataTypes.INTEGER, allowNull: false },
      channel: {
        type: DataTypes.ENUM('google', 'meta', 'tiktok', 'email'),
        allowNull: false,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      budget: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
      start_date: { type: DataTypes.DATEONLY, allowNull: true },
      end_date: { type: DataTypes.DATEONLY, allowNull: true },
    },
    {
      tableName: 'campaigns',
      // NOTE: `timestamps: false` + `paranoid: true` together silently disable soft-delete in
      // Sequelize (destroy() falls back to a hard DELETE) -- must disable createdAt/updatedAt
      // individually instead, since the spec's campaigns table has no created_at column.
      createdAt: false,
      updatedAt: false,
      paranoid: true,
      deletedAt: 'deleted_at',
      indexes: [{ fields: ['client_id'] }, { fields: ['client_id', 'status'] }],
    },
  );

  Campaign.associate = (models) => {
    Campaign.belongsTo(models.Client, { foreignKey: 'client_id' });
  };

  return Campaign;
};
