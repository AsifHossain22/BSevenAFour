import app from './app';
import { prisma } from './lib/prisma';
import 'dotenv/config';

const PORT = process.env.PORT;

async function main() {
  try {
    // PrismaFromLib
    await prisma.$connect();
    console.log('Connected to the database successfully!');

    app.listen(PORT, () => {
      console.log(`FixItNow server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    // await prisma.$disconnect();
    process.exit(1);
  }
}
main();
