import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    created_at: z.string().optional(),
});

export const ActivitySchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    description: z.string().optional(),
    created_at: z.string().optional(),
});

export const UserActivitySchema = z.object({
    id: z.string().uuid().optional(),
    user_id: z.string().uuid(),
    activity_id: z.string().uuid(),
    created_at: z.string().optional(),
});

export const PlanSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    description: z.string().optional(),
    activity_id: z.string().uuid(),
    created_at: z.string().optional(),
});

export const UpsertPlanSchema = PlanSchema.omit({ id: true, created_at: true });

export const ExerciseGroupSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    plan_id: z.string().uuid(),
    created_at: z.string().optional(),
});

export const UpsertExerciseGroupSchema = ExerciseGroupSchema.omit({ id: true, created_at: true });

export const ExerciseSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    description: z.string().optional(),
    tracking_type: z.string(),
    created_at: z.string().optional(),
});

export const UpsertExerciseSchema = ExerciseSchema.omit({ id: true, created_at: true });

export const ExerciseGroupExerciseSchema = z.object({
    exercise_group_id: z.string().uuid(),
    exercise_id: z.string().uuid(),
});

export const ExerciseLogSchema = z.object({
    id: z.string().uuid().optional(),
    user_id: z.string().uuid(),
    exercise_id: z.string().uuid(),
    metrics: z.record(z.any()),
    created_at: z.string().optional(),
});

export const UpsertExerciseLogSchema = ExerciseLogSchema.omit({ id: true, created_at: true });

export const GroupExercisesResponseSchema = z.object({
    exercise_group_id: z.string().uuid(),
    group_name: z.string(),
    exercises: z.array(ExerciseSchema),
});

export type User = z.infer<typeof UserSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type UserActivity = z.infer<typeof UserActivitySchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type UpsertPlan = z.infer<typeof UpsertPlanSchema>;
export type ExerciseGroup = z.infer<typeof ExerciseGroupSchema>;
export type UpsertExerciseGroup = z.infer<typeof UpsertExerciseGroupSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type UpsertExercise = z.infer<typeof UpsertExerciseSchema>;
export type ExerciseGroupExercise = z.infer<typeof ExerciseGroupExerciseSchema>;
export type ExerciseLog = z.infer<typeof ExerciseLogSchema>;
export type UpsertExerciseLog = z.infer<typeof UpsertExerciseLogSchema>;
export type GroupExercisesResponse = z.infer<typeof GroupExercisesResponseSchema>;
