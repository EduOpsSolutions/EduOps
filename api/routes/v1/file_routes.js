import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadFile, listFiles } from '../../utils/fileStorageUtil.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

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
        const categories = fs.readdirSync(UPLOAD_DIR).filter(
            item => fs.statSync(path.join(UPLOAD_DIR, item)).isDirectory()
        );

        const allFiles = {};
        for (const category of categories) {
            const files = await listFiles(category);
            if (files.length > 0) {
                allFiles[category] = files;
            }
        }

        res.json({
            success: true,
            data: allFiles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/list/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const files = await listFiles(category);
        
        res.json({
            success: true,
            category,
            data: files
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


export { router };