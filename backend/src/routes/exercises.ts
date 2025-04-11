import { Context } from 'hono';
import { supabase } from '../index';
import {
    UpsertExerciseGroupSchema,
    UpsertExerciseSchema,
    ExerciseGroupExerciseSchema,
    UpsertExerciseLogSchema
} from '../models';
import { v4 as uuidv4 } from 'uuid';

export async function getExerciseGroupsByPlan(c: Context) {
    const planId = c.req.param('planId');

    try {
        const { data, error } = await supabase
            .from('exercise_groups')
            .select('*')
            .eq('plan_id', planId);

        if (error) {
            return c.json({ error: 'Could not retrieve exercise groups', details: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Failed to retrieve exercise groups', details: String(err) }, 500);
    }
}

export async function createExerciseGroup(c: Context) {
    try {
        const body = await c.req.json();
        const groupData = UpsertExerciseGroupSchema.parse(body);

        const { data, error } = await supabase
            .from('exercise_groups')
            .insert([groupData])
            .select();

        if (error) {
            return c.json({ error: 'Could not create exercise group', details: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Failed to create exercise group', details: String(err) }, 500);
    }
}

export async function getExercisesByGroup(c: Context) {
    const groupId = c.req.param('groupId');

    try {
        // Verify the group exists
        const { data: group, error: groupError } = await supabase
            .from('exercise_groups')
            .select('id, name')
            .eq('id', groupId)
            .single();

        if (groupError || !group) {
            return c.json({ error: 'Exercise group not found' }, 404);
        }

        // Fetch exercises in the group
        const { data: exerciseRelations, error: relationsError } = await supabase
            .from('exercise_group_exercises')
            .select('exercise_group_id, exercise_id, exercises(id, name, description, tracking_type)')
            .eq('exercise_group_id', groupId);

        if (relationsError) {
            return c.json({ error: 'Failed to fetch exercises', details: relationsError.message }, 500);
        }

        // Prepare response
        const exercises = exerciseRelations?.map(relation => (relation.exercises)) || [];

        return c.json({
            exercise_group_id: groupId,
            group_name: group.name,
            exercises: exercises
        });
    } catch (err) {
        return c.json({ error: 'Failed to retrieve exercises', details: String(err) }, 500);
    }
}

export async function createExercise(c: Context) {
    try {
        const body = await c.req.json();
        const exerciseData = UpsertExerciseSchema.parse(body);

        const { data, error } = await supabase
            .from('exercises')
            .insert([exerciseData])
            .select();

        if (error) {
            return c.json({ error: 'Could not create exercise', details: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Failed to create exercise', details: String(err) }, 500);
    }
}

export async function addExerciseToGroup(c: Context) {
    try {
        const body = await c.req.json();
        const groupId = c.req.param('groupId');

        // Override the group ID from the path parameter
        const exerciseGroupRelation = ExerciseGroupExerciseSchema.parse({
            ...body,
            exercise_group_id: groupId
        });

        // Check if exercise group exists
        const { data: group, error: groupError } = await supabase
            .from('exercise_groups')
            .select('id, name')
            .eq('id', exerciseGroupRelation.exercise_group_id)
            .single();

        if (groupError || !group) {
            return c.json({ error: 'Exercise group not found' }, 404);
        }

        // Check if exercise exists
        const { data: exercise, error: exerciseError } = await supabase
            .from('exercises')
            .select('id, name, description')
            .eq('id', exerciseGroupRelation.exercise_id)
            .single();

        if (exerciseError || !exercise) {
            return c.json({ error: 'Exercise not found' }, 404);
        }

        // Insert the exercise to group
        const { error: insertError } = await supabase
            .from('exercise_group_exercises')
            .insert([exerciseGroupRelation]);

        if (insertError) {
            return c.json({ error: 'Failed to add exercise to group', details: insertError.message }, 500);
        }

        // Prepare the response
        return c.json({
            exercise_group_id: group.id,
            group_name: group.name,
            exercise: {
                id: exercise.id,
                name: exercise.name,
                description: exercise.description
            }
        });
    } catch (err) {
        return c.json({ error: 'Failed to add exercise to group', details: String(err) }, 500);
    }
}

export async function getExercises(c: Context) {
    try {
        const { data, error } = await supabase
            .from('exercises')
            .select('id, name, description, tracking_type');

        if (error) {
            return c.json({ error: 'Could not retrieve exercises', details: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Failed to retrieve exercises', details: String(err) }, 500);
    }
}

export async function logExercise(c: Context) {
    try {
        const body = await c.req.json();
        const logData = UpsertExerciseLogSchema.parse(body);

        // First, fetch the full exercise details
        const { data: exercise, error: exerciseError } = await supabase
            .from('exercises')
            .select('id, name, tracking_type, description')
            .eq('id', logData.exercise_id)
            .single();

        if (exerciseError || !exercise) {
            return c.json({ error: 'Exercise not found' }, 404);
        }

        // Insert the exercise log
        const { data: insertedLog, error: insertError } = await supabase
            .from('exercise_logs')
            .insert([logData])
            .select()
            .single();

        if (insertError || !insertedLog) {
            return c.json({ error: 'Failed to log exercise', details: insertError?.message }, 500);
        }

        // Prepare the response with full exercise details
        return c.json({
            id: insertedLog.id,
            user_id: insertedLog.user_id,
            metrics: insertedLog.metrics,
            created_at: insertedLog.created_at,
            exercise_id: insertedLog.exercise_id,
            exercise: {
                id: exercise.id,
                name: exercise.name,
                tracking_type: exercise.tracking_type,
                description: exercise.description
            }
        });
    } catch (err) {
        return c.json({ error: 'Failed to log exercise', details: String(err) }, 500);
    }
}

export async function getExerciseLogsByUser(c: Context) {
    const userId = c.req.param('userId');

    try {
        const { data, error } = await supabase
            .from('exercise_logs')
            .select('*, exercise:exercise_id(id, name, description, tracking_type)')
            .eq('user_id', userId);

        if (error) {
            return c.json({ error: 'Could not retrieve exercise logs', details: error.message }, 500);
        }

        // Format the response
        const formattedLogs = data.map(log => ({
            id: log.id,
            user_id: log.user_id,
            metrics: log.metrics,
            created_at: log.created_at,
            exercise_id: log.exercise_id,
            exercise: {
                id: log.exercise.id,
                name: log.exercise.name,
                tracking_type: log.exercise.tracking_type,
                description: log.exercise.description
            }
        }));

        return c.json(formattedLogs);
    } catch (err) {
        return c.json({ error: 'Failed to retrieve exercise logs', details: String(err) }, 500);
    }
}