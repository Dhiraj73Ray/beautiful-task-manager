import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AddTask = ({fetchTasks, session }) => {
  const [newtask, setNewtask] = useState({
    title: "", 
    desc: null,
    user_id: session.user.id
  })
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validate fields
    if (!newtask.title.trim()) {
      alert("Task title cannot be empty!");
      return;
    }

    setIsSubmitting(true);

    const taskData = {
      title: newtask.title.trim(),
      desc: newtask.desc?.trim() || "No description"
    };
    
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({...taskData, user_id: session.user.id})
        .single();

      if (error) {
        console.log("Error Adding Task: ", error.message);
        alert("Failed to add task. Please try again.");
        return;
      }

      // Reset form only if successful
      setNewtask({ title: "", desc: null });
      await fetchTasks();

    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false); 
    }
  };


  return (
    <div className="add-task-container">
      <h2>Add New Task</h2>
      <form onSubmit={handleSubmit} className="task-form">
        <input 
          type="text"
          value={newtask.title}
          onChange={(e) => setNewtask((prev) => ({...prev, title: e.target.value}))}
          placeholder="Enter task title..." 
          className="task-input"
          disabled={isSubmitting}
        />
        <textarea 
          placeholder="Enter task description..." 
          value={newtask.desc || ""}
          onChange={(e) => setNewtask((prev) => ({...prev, desc: e.target.value}))}
          className="task-textarea"
          disabled={isSubmitting}
        ></textarea>
        <div className="form-actions">
          <button type="submit" className="add-button" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTask;