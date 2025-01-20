import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Calendar, AlertCircle, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import './ProjectPage.css';

import { IP } from '../App';

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [task, setTask] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const fetchProject = async () => {
    try {
      const response = await fetch(`${IP}/projects/${id}`);
      if (!response.ok) {
        throw new Error('Proyecto no encontrado');
      }
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`${IP}/projects/${id}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, date }),
      });
      setTask('');
      setDate('');
      await fetchProject();
    } catch (error) {
      console.error('Error adding reminder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (note.trim()) {
      setIsSubmitting(true);
      try {
        await fetch(`${IP}/projects/${id}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note }),
        });
        setNote('');
        await fetchProject();
      } catch (error) {
        console.error('Error adding note:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteNote = async (index) => {
    if (window.confirm('¿Estás seguro que deseas borrar esta nota?')) {
      try {
        await fetch(`${IP}/projects/${id}/notes/${index}`, {
          method: 'DELETE',
        });
        await fetchProject();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleDeleteReminder = async (index, task) => {
    if (window.confirm(`¿Estás seguro que deseas borrar el recordatorio "${task}"?`)) {
      try {
        await fetch(`${IP}/projects/${id}/reminders/${index}`, {
          method: 'DELETE',
        });
        await fetchProject();
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      try {
        const response = await fetch(`${IP}/projects/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('No se pudo eliminar el proyecto');
        }
        navigate('/'); // Redirige al usuario después de eliminar
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error al eliminar el proyecto.');
      }
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [note]);

  if (isLoading) {
    return (
      <div className="loading-state">
        <Loader2 className="animate-spin" size={48} />
        <p>Cargando proyecto...</p>
      </div>
    );
  }

  if (!project) return null;

  const MAX_NOTE_LENGTH = 500;

  return (
    <div className="project-page">
      <div className="project-header">
        <button onClick={() => navigate('/')} className="back-button">
          <ArrowLeft size={20} />
          Volver
        </button>
        <h1>{project.name}</h1>
      </div>

      <section>
        <h2>Notas</h2>
        {project.notes.length === 0 ? (
          <div className="empty-state">
            <p>No hay notas en este proyecto.</p>
          </div>
        ) : (
          <ul className="notes-list">
            {project.notes.map((note, index) => (
              <li key={index}>
                {note}
                <button
                  className="delete-item-button"
                  onClick={() => handleDeleteNote(index)}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="add-form">
          <h3>Agregar Nota</h3>
          <form onSubmit={handleAddNote}>
            <div className="textarea-container">
              <textarea
                ref={textareaRef}
                placeholder="Escribe una nota"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
                maxLength={MAX_NOTE_LENGTH}
                disabled={isSubmitting}
              ></textarea>
              <span className={`char-count ${note.length === MAX_NOTE_LENGTH ? 'limit' : ''}`}>
                {note.length}/{MAX_NOTE_LENGTH}
              </span>
            </div>
            <button type="submit" disabled={isSubmitting || note.trim().length === 0}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Plus size={20} />
              )}
              Agregar Nota
            </button>
          </form>
        </div>
      </section>

      <section>
        <h2>Recordatorios</h2>
        {project.reminders.length === 0 ? (
          <div className="empty-state">
            <p>No hay recordatorios en este proyecto.</p>
          </div>
        ) : (
          <ul className="reminders-list">
            {project.reminders.map((reminder, index) => (
              <li key={index}>
                <div className="reminder-content">
                  <span className="reminder-task">{reminder.task}</span>
                  <span className="reminder-date">
                    {new Date(reminder.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <button
                  className="delete-item-button"
                  onClick={() => handleDeleteReminder(index, reminder.task)}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="add-form">
          <h3>Agregar Recordatorio</h3>
          <form onSubmit={handleAddReminder} className="reminder-form">
            <input
              type="text"
              placeholder="Tarea"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isSubmitting}
              min={new Date().toISOString().split('T')[0]}
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Plus size={20} />
              )}
              Agregar
            </button>
          </form>
        </div>
      </section>
      <button onClick={handleDeleteProject} className="delete-button">
        <Trash2 size={20} />
        Eliminar Proyecto
      </button>
    </div>
  );
};

export default ProjectPage;