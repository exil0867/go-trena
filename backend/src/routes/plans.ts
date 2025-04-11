import { Context } from 'hono';
import { supabase } from '../index';
import { UpsertPlanSchema } from '../models';

export async function getPlan(c: Context) {
    const planId = c.req.param('id');

    try {
        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (error) {
            return c.json({ error: 'Plan not found', details: error.message }, 404);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Failed to retrieve plan', details: String(err) }, 500);
    }
}

export async function createPlan(c: Context) {
    try {
        const body = await c.req.json();
        const planData = UpsertPlanSchema.parse(body);

        const { data, error } = await supabase
            .from('plans')
            .insert([planData])
            .select();

        if (error) {
            return c.json({ error: 'Could not create plan', details: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Failed to create plan', details: String(err) }, 500);
    }
}

export async function getPlans(c: Context) {

    try {
        let query = supabase.from('plans').select('*');

        const { data, error } = await query;

        if (error) {
            return c.json({ error: 'Could not retrieve plans', details: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Failed to retrieve plans', details: String(err) }, 500);
    }
}