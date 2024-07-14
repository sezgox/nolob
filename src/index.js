import cors from 'cors';
import { config } from 'dotenv';
import express, { json } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { projectsRouter } from './routes/projects.js';
import { usersRouter } from './routes/users.js';


config();

const app = express();

const PORT = process.env.PORT ?? 3003;

const __filename = fileURLToPath(import.meta.url);

// Obtén el directorio del archivo
const __dirname = path.dirname(__filename);

app.use(json({ limit: '50mb' }));
app.use(cors({
    origin: ['https://7q8hd2bw-4200.uks1.devtunnels.ms','http://localhost:4200','https://juan-manuel-mateo.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

//Este middleware permite servir archivos estáticos en la ruta dada como primer parámetro, haciendo referencia a los archivos guardados en la carpeta dada como parámtro de la función static()
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

app.use('/users', usersRouter)
app.use('/projects', projectsRouter)


//RUTA A LA NADA...
app.use((req,res) => {
    res.status(404).send('<h1>404 Not Found</h1>')
});

/* SERVER LISTENING */
app.listen(PORT, () => {
    console.log('Listening on port', PORT)
});


/* DB CONNECTION */
mongoose.connect(process.env.db)
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error(err));