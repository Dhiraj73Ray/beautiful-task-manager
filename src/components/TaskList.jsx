import React, { use, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import Task from './Task';

const TaskList = ({tasks, fetchTasks, changeCompleted}) => {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const tasksContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false)
  const [activeFilter, setActiveFilter] = useState("active")

  const filters = [
    {status: "Active", value: "active"},
    {status: "Completed", value: "completed"},
    {status: "All", value: "all"}
  ]
  
const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });

  const changeActiveFilter = (id) => {
    const newfilter = filters[id].value
    setActiveFilter(newfilter)
    
  }
  
  useEffect(() => {
    setLoading(true);
    fetchTasks();
    setLoading(false);
    const handleClickOutside = (event) => {
      if (tasksContainerRef.current && 
          !tasksContainerRef.current.contains(event.target)) {
        setSelectedTaskId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
  };

  const handleEditTask = async (taskId, newTitle, newDesc) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          title: newTitle,
          desc: newDesc.trim() == "" ? "No Description" : newDesc 
        })
        .eq('id', taskId);

      if (error) throw error;
      
      // Refresh tasks after edit
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh tasks after edit
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  }


  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="task-list-container">
      <h2>Your Tasks</h2>
      <div className="task-filters">
        {filters.map((filter, idx) => {
          return (
            <button className={`filter-button ${activeFilter === filter.value ? 'active' : ''}`} onClick={() => changeActiveFilter(idx)} value={filter.value} key={idx}>{filter.status}</button>
          )
        })}
      </div>
      <div 
        className="tasks" 
        ref={tasksContainerRef}
        onClick={(e) => e.stopPropagation()}
      >
      {filteredTasks.map(taskItem => (
        <Task
          key={taskItem.id}
          id={taskItem.id}  // Pass ID directly
          title={taskItem.title}
          description={taskItem.desc}
          completed={taskItem.completed}
          setCompleted={setCompleted}
          changeCompleted={changeCompleted}
          onTaskClick={handleTaskClick}
          onEditTask={handleEditTask}
          isSelected={taskItem.id === selectedTaskId}
          deleteTask = {handleDelete}
        />
      ))}
      </div>
    </div>
  );
};

export default TaskList;