import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../api/supabase';
import { fetchUserActivities } from '../api/reqs';

interface Activity {
    id: string;
    created_at: string;
    activities: {
        name: string;
        description: string | null;
        created_at: string;
    };
}

interface AppContextProps {
    isLoading: boolean;
}

const AppContext = createContext<AppContextProps>({
    isLoading: false,
});

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);


    return (
        <AppContext.Provider
            value={{
                isLoading
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
