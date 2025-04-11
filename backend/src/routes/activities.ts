
import { Context } from 'hono';
import { supabase } from '../index';
import { ActivitySchema, UserActivitySchema } from '../models';

export async function getActivities(c: Context) {
    try {
        const { data, error } = await supabase
            .from('activities')
            .select('*');

        if (error) {
            return c.json({ error: 'Could not retrieve activities', details: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Failed to retrieve activities', details: String(err) }, 500);
    }
}

export async function addUserActivity(c: Context) {
    try {
        const body = await c.req.json();
        const userActivity = UserActivitySchema.parse(body);

        const { data, error } = await supabase
            .from('user_activities')
            .insert([userActivity])
            .select();

        if (error) {
            return c.json({ error: 'Failed to add activity to user', details: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Failed to add activity to user', details: String(err) }, 500);
    }
}

export async function getUserActivities(c: Context) {
    const jwtPayload = c.get('jwtPayload');
    const userId = jwtPayload?.sub;
    const activityId = c.req.query('activity_id');

    if (!userId) {
        return c.json({ error: 'User ID not found in token' }, 401);
    }

    try {
        let query = supabase
            .from('user_activities')
            .select('id, created_at, activities(id, name, description)')
            .eq('user_id', userId);

        if (activityId) {
            query = query.eq('activity_id', activityId);
        }

        const { data, error } = await query;

        if (error) {
            return c.json({ error: 'Could not retrieve user activities', details: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Failed to retrieve user activities', details: String(err) }, 500);
    }
}