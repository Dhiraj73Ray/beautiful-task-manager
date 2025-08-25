import { useState, useEffect } from 'react';
import {supabase} from './supabaseClient';
import TaskManager from './pages/TaskManager';
import Auth from './pages/Auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

function App() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  
  return (
    <div className='parent-manager'>
      <div className="app-container">
        {!session ? (
          <Auth />
        ) : (
          <TaskManager session={session} />
        )}
      </div>
    </div>
  );
}

export default App;