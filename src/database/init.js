import db from './models/index.js';
import bcrypt from 'bcryptjs';

// filepath: src/database/init.js
const createMasterUser = async () => {
  try {
    console.log('Verificando usuario maestro...');
    const existingMaster = await db.User.findOne({ where: { email: 'master@system.com' } });
    if (!existingMaster) {
      console.log('Creando usuario maestro...');
      const hashedPassword = await bcrypt.hash('MasterPass123!', 10);
      await db.User.create({
        name: 'Master Admin',
        email: 'master@system.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Usuario maestro creado exitosamente.');
    } else {
      console.log('Usuario maestro ya existe.');
    }
  } catch (error) {
    console.error('Error creando usuario maestro:', error);
  }
};

export default createMasterUser;