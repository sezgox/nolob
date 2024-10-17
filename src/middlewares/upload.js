import multer from 'multer';

const storage = multer.memoryStorage(); // Usar memoria en lugar de disco

const upload = multer({ storage });

const uploadFields = upload.fields([
    { name: 'media', maxCount: 10 },
    { name: 'files', maxCount: 1 }
  ]);

export default uploadFields;