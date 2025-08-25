import { useEffect, useState } from 'react';
import AddTask from '../components/AddTask';
import TaskList from '../components/TaskList';
import '../styles/main.css';
import { supabase } from '../supabaseClient';
import dotenv from "dotenv"

function tasks({session}) {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Set up the realtime subscription
    const channel = supabase
      .channel('task_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          // Handle different types of changes
          switch(payload.eventType) {
            case 'INSERT':
              setTasks(prev => [payload.new, ...prev]);
              break;
            case 'UPDATE':
              setTasks(prev => prev.map(task => 
                task.id === payload.new.id ? payload.new : task
              ));
              break;
            case 'DELETE':
              setTasks(prev => prev.filter(task => task.id !== payload.old.id));
              break;
            default:
              fetchTasks(); // Fallback to full refresh for other cases
          }
        }
      )
      .subscribe();

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const changeCompleted = async (id, currentCompletedStatus) => {
    const newCompletedStatus = !currentCompletedStatus;
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompletedStatus })
        .eq('id', id);
      if (error) throw error;
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task status');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  }

  return (
    <>
      <div className='app-header'>
        <div className="header-content">
          <h1 className="app-title">Beautiful Task Manager</h1>
          <button className='logout-button' onClick={logout}>
            Logout
          </button>
        </div>
      </div>
      <div className="app-grid">
        <div className="task-adding">
          <AddTask fetchTasks={fetchTasks} session={session} />
        </div>
        <div className='task-list'>
          <TaskList tasks={tasks} fetchTasks={fetchTasks} changeCompleted={changeCompleted} />
        </div>
      </div>
    </>
  );
}

export default tasks;