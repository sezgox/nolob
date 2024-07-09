// middlewares/upload.js
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';



// Convierte la URL del módulo en una ruta de archivo
const __filename = fileURLToPath(import.meta.url);
// Obtén el directorio del archivo
const __dirname = path.dirname(__filename);

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            req.body.project = JSON.parse(req.body.project);
            req.body.project.id = req.body.project.id ?? uuidv4();
            const uploadPath = path.join(__dirname, '..', 'uploads', req.body.project.id);
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true }); // Asegura la creación recursiva del directorio
            }
            req.body.project = JSON.stringify(req.body.project); 
            cb(null, uploadPath);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

export default upload;
