import multer from 'multer';

const storage = multer.memoryStorage(); // Usar memoria en lugar de disco

const upload = multer({ storage });

export default upload;