import { Context } from 'hono';
import { supabase } from '../index';
import { AuthResponse } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export async function signUp(c: Context) {
    const { email, password } = await c.req.json();

    if (!email || !password) {
        return c.json({ error: 'Invalid request' }, 400);
    }

    try {
        const { data, error }: AuthResponse = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return c.json({ error: 'Signup failed', details: error.message }, 401);
        }

        return c.json({ session: data });
    } catch (err) {
        return c.json({ error: 'Signup failed', details: String(err) }, 500);
    }
}

export async function signIn(c: Context) {
    const { email, password } = await c.req.json();

    if (!email || !password) {
        return c.json({ error: 'Invalid request' }, 400);
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return c.json({ error: 'Login failed', details: error.message }, 401);
        }

        return c.json({
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            expires_in: data.session?.expires_in,
        });
    } catch (err) {
        return c.json({ error: 'Login failed', details: String(err) }, 500);
    }
}

export async function refreshToken(c: Context) {
    const { refresh_token } = await c.req.json();

    if (!refresh_token) {
        return c.json({ error: 'Invalid request' }, 400);
    }

    try {
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token,
        });

        if (error) {
            return c.json({ error: 'Token refresh failed', details: error.message }, 401);
        }

        return c.json({
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            expires_in: data.session?.expires_in,
        });
    } catch (err) {
        return c.json({ error: 'Token refresh failed', details: String(err) }, 500);
    }
}

export async function getCurrentUser(c: Context) {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;

        return c.json({
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
        });
    } catch (err) {
        return c.json({ error: 'Invalid token', details: String(err) }, 401);
    }
}