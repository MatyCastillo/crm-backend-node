import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.join(__dirname, '../logs/error.log');

const logger = (error) => {
  // Obtener la fecha y hora en la zona horaria de Argentina
  const argentinaTime = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());

  // Loguear el error en un archivo
  fs.appendFile(logFilePath, `${argentinaTime} - ${error}\n`, (err) => {
    if (err) {
      console.error('Error al escribir en el archivo de registro:', err);
    }
  });
};

export default logger;
