import { AppDataSource } from '../backend/src/utils/database';
import { User, Project } from '../backend/src/entities';
import * as bcrypt from 'bcryptjs';

async function seed() {
  await AppDataSource.initialize();

  console.log('Database connected');

  const userRepository = AppDataSource.getRepository(User);
  const projectRepository = AppDataSource.getRepository(Project);

  // Check if admin user already exists
  const existingAdmin = await userRepository.findOne({ where: { username: 'admin' } });
  if (existingAdmin) {
    console.log('Admin user already exists');
    await AppDataSource.destroy();
    return;
  }

  // Create admin user
  const admin = userRepository.create({
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123456',
  });

  await userRepository.save(admin);
  console.log('Admin user created: username=admin, password=admin123456');

  // Create demo project
  const demoProject = projectRepository.create({
    name: '示例项目',
    key: 'demo-project-key',
    description: '这是一个示例项目，您可以删除或编辑它',
    website: 'https://example.com',
    userId: admin.id,
  });

  await projectRepository.save(demoProject);
  console.log('Demo project created');

  await AppDataSource.destroy();
  console.log('Seeding completed');
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
