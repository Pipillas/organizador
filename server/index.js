const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose
  .connect('mongodb://127.0.0.1:27017/gestorProyectos')
  .then(() => console.log('✅ Conexión exitosa a la base de datos MongoDB'))
  .catch((error) => console.error('❌ Error al conectar a MongoDB:', error));

// Definir esquema y modelo de proyecto
const projectSchema = new mongoose.Schema({
  name: String,
  notes: [{ type: String }],
  reminders: [{ task: String, date: Date }],
});
const Project = mongoose.model('Project', projectSchema);

// ✅ Todas las rutas de la API empiezan con `/api/projects`
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los proyectos' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ error: 'Proyecto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el proyecto' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre del proyecto es requerido' });

    const newProject = new Project({ name, notes: [], reminders: [] });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el proyecto' });
  }
});

app.post('/api/projects/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    project.notes.push(note);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar la nota' });
  }
});

app.post('/api/projects/:id/reminders', async (req, res) => {
  try {
    const { id } = req.params;
    const { task, date } = req.body;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    project.reminders.push({ task, date });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el recordatorio' });
  }
});

app.delete('/api/projects/:id/notes/:noteIndex', async (req, res) => {
  try {
    const { id, noteIndex } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    if (noteIndex >= 0 && noteIndex < project.notes.length) {
      project.notes.splice(noteIndex, 1);
      await project.save();
      res.status(200).json(project);
    } else {
      res.status(400).json({ error: 'Índice de nota inválido' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la nota' });
  }
});

app.delete('/api/projects/:id/reminders/:reminderIndex', async (req, res) => {
  try {
    const { id, reminderIndex } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    if (reminderIndex >= 0 && reminderIndex < project.reminders.length) {
      project.reminders.splice(reminderIndex, 1);
      await project.save();
      res.status(200).json(project);
    } else {
      res.status(400).json({ error: 'Índice de recordatorio inválido' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el recordatorio' });
  }
});

app.get('/api/reminders', async (req, res) => {
  try {
    const projects = await Project.find();
    const reminders = projects.flatMap(project =>
      project.reminders.map(reminder => ({
        project: project.name,
        task: reminder.task,
        date: reminder.date,
      }))
    );
    reminders.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los recordatorios' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    res.status(200).json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el proyecto' });
  }
});

// 📌 Servir React correctamente en todas las rutas que no sean API
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// ✅ Solo las rutas que NO son de la API servirán `index.html`
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Iniciar servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
