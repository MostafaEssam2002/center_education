const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const activeRooms = await prisma.room.findMany({ where: { isActive: true } });
    console.log('Active rooms:', activeRooms.length);
    activeRooms.forEach(r => console.log(`- ${r.name} (${r.type})`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
