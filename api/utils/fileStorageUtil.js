import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

export const uploadFile = async (file, category = 'others') => {
    try {
        const categoryDir = path.join(UPLOAD_DIR, category);
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileExt = path.extname(file.originalname);
        const rawFileName = path.basename(file.originalname, fileExt);
        const fileName = `${category}_${rawFileName}_${timestamp}${fileExt}`;
        const filePath = path.join(categoryDir, fileName);

        await fs.promises.writeFile(filePath, file.buffer);
        const fileUrl = `/uploads/${category}/${fileName}`;
        
        return {
            fileName,
            filePath,
            fileUrl
        };
    } catch (error) {
        throw new Error(`Error uploading file: ${error.message}`);
    }
};

export const listFiles = async (category = 'others') => {
    try {
        const categoryDir = path.join(UPLOAD_DIR, category);
        if (!fs.existsSync(categoryDir)) {
            return [];
        }

        const files = await fs.promises.readdir(categoryDir);
        return files
            .filter(file => file !== '.gitkeep')
            .map(file => ({
                name: file,
                url: `/uploads/${category}/${file}`
            }));
    } catch (error) {
        throw new Error(`Error listing files: ${error.message}`);
    }
};