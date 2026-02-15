import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Get API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  // Check API health on mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  // Fetch tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/health`);
      setApiStatus(response.data);
    } catch (err) {
      console.error('API health check failed:', err);
      setApiStatus({ status: 'error', message: 'Cannot connect to backend' });
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/tasks`);
      setTasks(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks. Make sure the backend is running.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      if (editingTask) {
        // Update existing task
        await axios.put(`${API_URL}/api/tasks/${editingTask._id}`, newTask);
        setEditingTask(null);
      } else {
        // Create new task
        await axios.post(`${API_URL}/api/tasks`, newTask);
      }
      
      setNewTask({ title: '', description: '' });
      fetchTasks();
    } catch (err) {
      setError('Failed to save task');
      console.error('Error saving task:', err);
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/tasks/${id}/toggle`);
      fetchTasks();
    } catch (err) {
      setError('Failed to toggle task');
      console.error('Error toggling task:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}/api/tasks/${id}`);
        fetchTasks();
      } catch (err) {
        setError('Failed to delete task');
        console.error('Error deleting task:', err);
      }
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setNewTask({ title: task.title, description: task.description || '' });
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setNewTask({ title: '', description: '' });
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>📝 MERN Task Manager</h1>
          <p className="subtitle">Full-stack deployment demo</p>
          
          {apiStatus && (
            <div className={`status-badge ${apiStatus.status}`}>
              <span className="status-dot"></span>
              {apiStatus.status === 'ok' ? 'Backend Connected' : 'Backend Disconnected'}
            </div>
          )}
        </header>

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError(null)} className="close-btn">×</button>
          </div>
        )}

        <div className="card">
          <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
          <form onSubmit={handleSubmit} className="task-form">
            <input
              type="text"
              placeholder="Task title *"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="input"
              required
            />
            <textarea
              placeholder="Task description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="input textarea"
              rows="3"
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingTask ? '💾 Update Task' : '➕ Add Task'}
              </button>
              {editingTask && (
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="tasks-header">
            <h2>Your Tasks</h2>
            <span className="task-count">{tasks.length} total</span>
          </div>

          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet. Add your first task above! 🎯</p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-content">
                    <div className="task-header">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggle(task._id)}
                        className="checkbox"
                      />
                      <h3>{task.title}</h3>
                    </div>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    <small className="task-date">
                      Created: {new Date(task.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <div className="task-actions">
                    <button
                      onClick={() => handleEdit(task)}
                      className="btn-icon"
                      title="Edit task"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="btn-icon"
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="footer">
          <p>
            Backend: <code>{API_URL}</code>
          </p>
          <p>Made with ❤️ for deployment demo</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
