
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { data, useNavigate } from 'react-router-dom';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      
      // 1. Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      
      // 2. Check if session exists and is not expired (<2 hours)
      if (session) {
        const lastLogin = localStorage.getItem('lastLogin');
        
        if (lastLogin) {
          const hoursDiff = (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60);

          
          if (hoursDiff > 0.05) {
            await supabase.auth.signOut();
            localStorage.removeItem('lastLogin');
            navigate('/login');
            return;
          }
        } else {
          // First time login - set timestamp
          localStorage.setItem('lastLogin', new Date().toISOString());
        }
      }
      
      setSession(session);
      setLoading(false);
    };

    checkSession();

    // 3. Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        localStorage.setItem('lastLogin', new Date().toISOString());
      }
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('lastLogin');
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return { session, loading };
}