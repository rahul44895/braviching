const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const idMiddleware = require('./middleware/id.middleware');
const errorMiddleware = require('./middleware/error.middleware');
const ApiError = require('./utils/ApiError');

const authRoutes = require('./modules/auth/auth.routes');
const campaignsRoutes = require('./modules/campaigns/campaigns.routes');
const storefrontsRoutes = require('./modules/storefronts/storefronts.routes');
const marketplaceAccountsRoutes = require('./modules/marketplaceAccounts/marketplaceAccounts.routes');
const clientsRoutes = require('./modules/clients/clients.routes');
const tasksRoutes = require('./modules/tasks/tasks.routes');
const departmentsRoutes = require('./modules/departments/departments.routes');
const usersRoutes = require('./modules/users/users.routes');
const managersRoutes = require('./modules/managers/managers.routes');
const auditLogsRoutes = require('./modules/auditLogs/auditLogs.routes');

const app = express();

app.use(idMiddleware);
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/campaigns', campaignsRoutes);
app.use('/storefronts', storefrontsRoutes);
app.use('/marketplace-accounts', marketplaceAccountsRoutes);
app.use('/clients', clientsRoutes);
app.use('/tasks', tasksRoutes);
app.use('/departments', departmentsRoutes);
app.use('/users', usersRoutes);
app.use('/managers', managersRoutes);
app.use('/audit-logs', auditLogsRoutes);

app.use((req, res, next) => next(new ApiError(404, 'Not found')));
app.use(errorMiddleware);

module.exports = app;
