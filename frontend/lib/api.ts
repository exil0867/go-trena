import { z } from 'zod';
import { supabase } from '../lib/supabase';

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url(),
});

const env = envSchema.parse(process.env);

const API_URL = env.EXPO_PUBLIC_API_URL;

const getHeaders = async () => {
  const session = await supabase.auth.getSession();
  const authToken = session.data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
  };
};

export const fetchUserActivities = async (userId: string) => {
  const response = await fetch(`${API_URL}/user-activities?user_id=${userId}`, {
    headers: await getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user activities');
  }
  return response.json();
};



export interface Exercise {
  id: string;
  name: string;
  category_id: string;
  description: string;
}
export interface FetchExercisesByGroupResponse {
  exercise_group_id: string;
  group_name: string;
  exercises: Exercise[];
}

export interface AddExerciseToGroupResponse {
  exercise_group_id: string;
  group_name: string;
  exercise: Exercise;
}



export const fetchExercisesByGroup = async (groupId: string): Promise<FetchExercisesByGroupResponse> => {
  const response = await fetch(`${API_URL}/exercise-groups/${groupId}/exercises`, {
    headers: await getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch exercises by group');
  }

  return response.json();
};

export const fetchExercises = async () => {
  const response = await fetch(`${API_URL}/exercises`, {
    headers: await getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch exercises');
  }
  return response.json();
};


export const fetchAllExercises = fetchExercises

export const fetchExerciseCategories = async () => {
  const response = await fetch(`${API_URL}/exercise-categories`, {
    headers: await getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch exercise categories');
  }
  return response.json();
};

export const addExerciseToGroup = async (groupId: string, exerciseId: string): Promise<AddExerciseToGroupResponse> => {
  const response = await fetch(`${API_URL}/exercise-groups/${groupId}/exercises`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ exercise_id: exerciseId, exercise_group_id: groupId }),
  });
  if (!response.ok) {
    throw new Error('Failed to add exercise to group');
  }
  return response.json();
};

export const createExercise = async (newExerciseName: string, newExerciseDescription: string, newExerciseCategoryId: string) => {

  const response = await fetch(`${API_URL}/exercises`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({
      name: newExerciseName.trim(),
      description: newExerciseDescription.trim(),
      category_id: newExerciseCategoryId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create exercise');
  }
  return response.json();
};

export const fetchRecentLogs = async () => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;

  if (userId) {
    const response = await fetch(`${API_URL}/users/${userId}/exercise-logs?limit=5`, {
      headers: await getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch recent logs');
    }
    const data = await response.json();
    if (data && Array.isArray(data)) {
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return data;
  }
};

export const fetchPlansById = async (selectedActivityId: string) => {
  if (!selectedActivityId) return;
  const response = await fetch(`${API_URL}/plans?activityId=${selectedActivityId}`, {
    headers: await getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch plans');
  }
  return response.json();
};

export const fetchLogs = async () => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;

  if (userId) {
    const response = await fetch(`${API_URL}/users/${userId}/exercise-logs`, {
      headers: await getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch logs');
    }
    const data = await response.json();
    if (data && Array.isArray(data)) {
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return data;
  }
};

export const logExercise = async (selectedExerciseId: string, sets: string, reps: string, weight: string, notes: string) => {
  if (!selectedExerciseId || !sets || !reps) return;

  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;

  if (userId) {
    const response = await fetch(`${API_URL}/exercise-logs`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({
        user_id: userId,
        exercise_id: selectedExerciseId,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : 0,
        notes: notes.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to log exercise');
    }
    return response.json();
  }
};

export const fetchExerciseGroupsByPlan = async (planId: string) => {
  const response = await fetch(`${API_URL}/plans/${planId}/groups`, {
    headers: await getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch exercise groups');
  }
  return response.json();
};

interface createExerciseGroupResponse {
  id: string,
  plan_id: string,
  day_of_week: number,
  name: string,
}

export const createExerciseGroup = async (planId: string, currentDay: number | null, newGroupName: string): Promise<createExerciseGroupResponse[]> => {

  const response = await fetch(`${API_URL}/exercise-groups`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({
      name: newGroupName.trim(),
      plan_id: planId,
      day_of_week: currentDay,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to add group');
  }
  return (response.json());
};

export const createPlan = async (selectedActivityId: string, newPlanName: string) => {
  if (!selectedActivityId || !newPlanName.trim()) return;

  console.log(selectedActivityId)

  const response = await fetch(`${API_URL}/plans`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({
      name: newPlanName.trim(),
      user_activity_id: selectedActivityId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create plan');
  }
  return response.json();
};

export const fetchActivities = async () => {
  const response = await fetch(`${API_URL}/activities`, {
    headers: await getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }
  console.log(response);
  return response.json();
};

export const addUserActivity = async (activityData: Record<string, any>) => {
  const response = await fetch(`${API_URL}/user-activities`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(activityData),
  });
  if (!response.ok) {
    throw new Error('Failed to add user activity');
  }
  return response.json();
};

export const fetchUserActivitiesByActivityId = async (activityId: string) => {
  const response = await fetch(`${API_URL}/user-activities?activity_id=${activityId}`, {
    headers: await getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user activities by activity ID');
  }
  return response.json();
};
