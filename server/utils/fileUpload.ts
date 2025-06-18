import multer, { FileFilterCallback, Multer } from 'multer';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

// Créer le répertoire d'uploads s'il n'existe pas
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, uploadDir);
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedFilename = file.originalname
      .replace(ext, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-') // Remplacer les caractères spéciaux par des tirets
      .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
      .replace(/^-+|-+$/g, ''); // Supprimer les tirets au début et à la fin
    
    const finalFilename = `${sanitizedFilename}-${uniqueSuffix}${ext}`;
    cb(null, finalFilename);
  },
});

// Filtre des types de fichiers autorisés
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non supporté: ${file.mimetype}. Utilisez JPG, PNG, PDF ou DOCX.`));
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max par fichier
    files: 2 // Maximum 2 fichiers (recto et verso)
  },
});

// Types pour les fichiers téléchargés
type FileFields = {
  documentFront?: Express.Multer.File[];
  documentBack?: Express.Multer.File[];
};

// Middleware pour gérer le téléchargement des fichiers
export const uploadFiles = (
  req: Request,
  res: Response,
  next: (error?: any) => void
) => {
  const uploadHandler = upload.fields([
    { name: 'documentFront', maxCount: 1 },
    { name: 'documentBack', maxCount: 1 },
  ]);

  uploadHandler(req, res, (err: any) => {
    if (err) {
      console.error('Erreur lors du téléchargement des fichiers:', err);
      
      // Gérer les erreurs spécifiques
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'La taille du fichier dépasse la limite autorisée (10 Mo)',
        });
      }
      
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Trop de fichiers téléchargés. Maximum 2 fichiers autorisés.',
        });
      }
      
      if (err.message.includes('Type de fichier non supporté')) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      
      // Erreur générique
      return res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors du téléchargement des fichiers',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
    
    // Si tout s'est bien passé, passer au middleware suivant
    next();
  });
};

export const getFileUrl = (filename: string): string => {
  if (!filename) return '';
  return `/uploads/${filename}`;
};

// Extension de l'interface Request pour inclure les fichiers
declare global {
  namespace Express {
    interface Request {
      files?: FileFields;
    }
  }
}
