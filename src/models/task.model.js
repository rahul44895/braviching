module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    'Task',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      client_id: { type: DataTypes.INTEGER, allowNull: false },
      assigned_to: { type: DataTypes.INTEGER, allowNull: true },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      category: {
        type: DataTypes.ENUM('marketplace', 'paid_media', 'email', 'storefront'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('open', 'in_progress', 'done'),
        allowNull: false,
        defaultValue: 'open',
      },
      due_date: { type: DataTypes.DATEONLY, allowNull: true },
    },
    {
      tableName: 'tasks',
      createdAt: 'created_at',
      updatedAt: false,
      paranoid: true,
      deletedAt: 'deleted_at',
      indexes: [
        { fields: ['client_id'] },
        { fields: ['assigned_to'] },
        { fields: ['client_id', 'status'] },
      ],
    },
  );

  Task.associate = (models) => {
    Task.belongsTo(models.Client, { foreignKey: 'client_id' });
    Task.belongsTo(models.User, { as: 'assignee', foreignKey: 'assigned_to' });
  };

  return Task;
};
