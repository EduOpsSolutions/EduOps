import express from 'express';
import multer from 'multer';
import { uploadFile, listFiles } from '../../utils/fileStorageUtil.js';

const router = express.Router();
const upload = multer();

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file; 
        const category = req.body.category || 'others'; 
        const result = await uploadFile(file, category);
        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/list', async (req, res) => {
    try {
        const files = await listFiles();
        
        res.json({
            error: false,
            files
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

export { router };