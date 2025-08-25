import React, { useState } from 'react';

const Task = ({
  id,
  title,
  description,
  completed,
  changeCompleted,
  onTaskClick,
  isSelected,
  onEditTask,
  deleteTask,
  showActions = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDesc, setEditedDesc] = useState(description);

  const handleEditSubmit = async (e) => {
    e.stopPropagation();
    if (onEditTask) {
      await onEditTask(id, editedTitle, editedDesc);
      setIsEditing(false);
    }
  };

  const handleDeleteTask = async (e) => {
    e.stopPropagation();
    if (deleteTask) {
      await deleteTask(id);
    }
  };

  const handleCompleted = async (e) => {
    e.stopPropagation();
    if (changeCompleted) {
      await changeCompleted(id, completed);
    }
  };

  return (
    <div
      className={`task-item ${completed ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!isEditing && onTaskClick) {
          onTaskClick(id);
        }
      }}
    >
      <div className="task-checkbox">
        <input 
          type="checkbox" 
          checked={completed} 
          onChange={handleCompleted} 
          disabled={!changeCompleted}
        />
      </div>
      <div className="task-content">
        {isEditing ? (
          <>
            <input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="edit-input"
            />
            <textarea
              value={editedDesc}
              onChange={(e) => setEditedDesc(e.target.value)}
              className="edit-textarea"
            />
          </>
        ) : (
          <>
            <h3 className="task-title">{title}</h3>
            <p className="task-description">{description}</p>
          </>
        )}
      </div>

      {showActions && (
        <div className="task-actions">
          {isEditing ? (
            <>
              <button className="save-button" onClick={handleEditSubmit}>
                Save
              </button>
              <button className="cancel-button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              {onEditTask && (
                <button
                  className="edit-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  Edit
                </button>
              )}
              {deleteTask && (
                <button className="delete-button" onClick={handleDeleteTask}>
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Task;