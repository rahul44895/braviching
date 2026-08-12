const path = require('path');
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
const permissionsRoutes = require('./modules/permissions/permissions.routes');

const app = express();

app.use(idMiddleware);
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Every API route lives under /api -- the frontend has its own client-side routes at these same
// bare names (/clients, /campaigns, /tasks, ...), so without this prefix a browser navigation to
// /clients and the frontend's own `fetch('/clients')` call would collide at the exact same path.
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/storefronts', storefrontsRoutes);
app.use('/api/marketplace-accounts', marketplaceAccountsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/managers', managersRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/permissions', permissionsRoutes);

app.use('/api', (req, res, next) => next(new ApiError(404, 'Not found')));

// Serve the built frontend (see frontend/ -- built via `npm run build` there, or by the
// Dockerfile's frontend build stage). Anything that isn't an API route or a real static file
// falls through to index.html, letting React Router handle client-side routes and deep-link
// refreshes (e.g. reloading on /campaigns directly).
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(errorMiddleware);

module.exports = app;
