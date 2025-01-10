// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Loader2, ArrowRight } from 'lucide-react';
import './HomePage.css';

import { IP } from '../App';

const CreateProjectModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [projectName, setProjectName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(projectName);
    setProjectName('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>Crear Nuevo Proyecto</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Nombre del proyecto"
            autoFocus
            required
          />
          <button type="submit" disabled={isSubmitting || !projectName.trim()}>
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Plus size={20} />
                Crear Proyecto
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${IP}/projects`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchReminders = async () => {
    try {
      const response = await fetch(`${IP}/reminder`);
      const data = await response.json();
      setReminders(data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = async (projectName) => {
    if (projectName.trim()) {
      setIsSubmitting(true);
      try {
        await fetch(`${IP}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: projectName }),
        });
        await fetchProjects();
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error adding project:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchReminders();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-state">
        <Loader2 className="animate-spin" size={48} />
        <p>Cargando proyectos...</p>
      </div>
    );
  }

  return (
    <div className="homepage-container">
      <header className="header">
        <h1>Gestor de Proyectos</h1>
      </header>

      <main>
        <section className="projects-section">
          <h2>Proyectos</h2>
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>No hay proyectos creados aún.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map(project => (
                <div key={project._id} className="project-card">
                  <h3>{project.name}</h3>
                  <div className="project-meta">
                    <span>{project.notes?.length || 0} notas</span>
                    <span>{project.reminders?.length || 0} recordatorios</span>
                  </div>
                  <Link to={`/projects/${project._id}`} className="view-details">
                    Ver detalles
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="reminders-section">
          <h2>Recordatorios</h2>
          {reminders.length === 0 ? (
            <div className="empty-state">
              <p>No hay recordatorios pendientes.</p>
            </div>
          ) : (
            <div className="reminders-grid">
              {reminders.map((reminder, index) => (
                <div key={index} className="reminder-card">
                  <h3>{reminder.project}</h3>
                  <p>{reminder.task}</p>
                  <p className="reminder-date">
                    {new Date(reminder.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <button
        className="floating-add-button"
        onClick={() => setIsModalOpen(true)}
        aria-label="Crear nuevo proyecto"
      >
        <Plus size={24} />
      </button>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProject}
        isSubmitting={isSubmitting}
      />

      <footer>
        <p>&copy; {new Date().getFullYear()} Gestor de Proyectos. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default HomePage;