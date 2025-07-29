import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [openTaskId, setOpenTaskId] = useState(null); // for description toggle

  const token = localStorage.getItem('token');

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      setError('Failed to load tasks');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', {
        title,
        description,
        dueDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      fetchTasks();
    } catch (err) {
      setError('Task creation failed');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch {
      setError('Failed to delete');
    }
  };

  const markDone = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}`, { status: 'done' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch {
      setError('Failed to update');
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchTasks();
    }
    // eslint-disable-next-line
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleTask = (id) => {
    setOpenTaskId(prevId => (prevId === id ? null : id));
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button className="logout-button" onClick={logout}>Logout</button>

      <form onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        {tasks.length === 0 ? (
          <>
            <div className="emoji bounce">😢</div>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>No tasks yet. Add your first one!</p>
          </>
        ) : (
          <>
            <div className="emoji wave">😄</div>
            <h3 style={{ color: '#1f2937' }}>Your Tasks</h3>
            <ul>
              {tasks.map((task) => (
                <li
                  key={task._id}
                  className={task.status}
                  onClick={() => toggleTask(task._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <strong>{task.title}</strong>
                    <div>
                      {task.status !== 'done' && (
                        <button onClick={(e) => markDone(task._id, e)}>Done</button>
                      )}
                      <button onClick={(e) => handleDelete(task._id, e)}>Delete</button>
                    </div>
                  </div>

                  {openTaskId === task._id && (
                    <div style={{ marginTop: '10px' }}>
                      <p><strong>Description:</strong> {task.description || 'No description provided'}</p>
                      <p><strong>Due Date:</strong> {task.dueDate?.split('T')[0] || 'No due date'}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
