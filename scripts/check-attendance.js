const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sessions = await prisma.courseSession.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    console.log('Recent Sessions:', sessions);

    if (sessions.length > 0) {
        const lastSessionId = sessions[0].id;
        console.log(`Checking attendance for session ${lastSessionId}...`);

        const attendance = await prisma.attendance.findMany({
            where: { sessionId: lastSessionId }
        });
        console.log('Attendance Records:', attendance);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
