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
  .then(() => {
    console.log('Conexión exitosa a la base de datos MongoDB');
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
  });

const projectSchema = new mongoose.Schema({
  name: String,
  notes: [{ type: String }],
  reminders: [{ task: String, date: Date }],
});
const Project = mongoose.model('Project', projectSchema);

// Endpoints para proyectos
app.get('/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

app.get('/projects/:id', async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ error: 'Proyecto no encontrado' });
  }
});

app.post('/projects', async (req, res) => {
  const { name } = req.body;
  if (name) {
    const newProject = new Project({ name, notes: [], reminders: [] });
    await newProject.save();
    res.status(201).json(newProject);
  } else {
    res.status(400).json({ error: 'El nombre del proyecto es requerido' });
  }
});

app.post('/projects/:id/notes', async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const project = await Project.findById(id);
  if (project) {
    project.notes.push(note);
    await project.save();
    res.status(201).json(project);
  } else {
    res.status(404).json({ error: 'Proyecto no encontrado' });
  }
});

app.post('/projects/:id/reminders', async (req, res) => {
  const { id } = req.params;
  const { task, date } = req.body;
  const project = await Project.findById(id);
  if (project) {
    project.reminders.push({ task, date });
    await project.save();
    res.status(201).json(project);
  } else {
    res.status(404).json({ error: 'Proyecto no encontrado' });
  }
});

app.get('/reminders', async (req, res) => {
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
});

app.delete('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (project) {
      res.status(200).json({ message: 'Proyecto eliminado correctamente' });
    } else {
      res.status(404).json({ error: 'Proyecto no encontrado' });
    }
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({ error: 'Error al eliminar el proyecto' });
  }
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
