import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { config } from './config';
import { createClient } from '@supabase/supabase-js';
import * as routes from './routes';

// Create a Supabase client
export const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// Create a Hono app
const app = new Hono();

// Add CORS middleware
app.use(cors({
    origin: 'http://localhost:8081',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true,
}));

// Auth middleware (exclude certain routes)
const excludedPaths = ['/auth/signup', '/auth/login', '/auth/refresh', '/auth/user'];

app.use('*', async (c, next) => {
    const path = c.req.path;
    if (excludedPaths.includes(path)) {
        return next();
    }

    // Continue with JWT authentication
    const jwtMiddleware = jwt({
        secret: config.jwtSecret,
    });

    return jwtMiddleware(c, next);
});

// Auth routes
app.post('/auth/signup', routes.signUp);
app.post('/auth/login', routes.signIn);
app.post('/auth/refresh', routes.refreshToken);
app.get('/auth/user', routes.getCurrentUser);

// Plan routes
app.get('/plans/:id', routes.getPlan);
app.post('/plans', routes.createPlan);
app.get('/plans', routes.getPlans);

// Exercise group routes
app.get('/plans/:planId/groups', routes.getExerciseGroupsByPlan);
app.post('/exercise-groups', routes.createExerciseGroup);
app.get('/exercise-groups/:groupId/exercises', routes.getExercisesByGroup);

// Exercise routes
app.post('/exercises', routes.createExercise);
app.post('/exercise-groups/:groupId/exercises', routes.addExerciseToGroup);
app.get('/exercises', routes.getExercises);

// Exercise log routes
app.post('/exercise-logs', routes.logExercise);
app.get('/users/:userId/exercise-logs', routes.getExerciseLogsByUser);

// Activity routes
app.get('/activities', routes.getActivities);
app.post('/user-activities', routes.addUserActivity);
app.get('/user-activities', routes.getUserActivities);

// Start the server
console.log(`Server is running on port ${config.port}`);
export default {
    port: config.port,
    fetch: app.fetch,
};