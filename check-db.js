const { PrismaClient } = require("@prisma/client");

async function checkDatabase() {
  const prisma = new PrismaClient();

  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        eventType: true,
      },
      take: 10,
    });

    console.log("Events from database:");
    events.forEach((event) => {
      console.log(`ID: ${event.id}`);
      console.log(`Title: "${event.title}"`);
      console.log(`Description: "${event.description}"`);
      console.log(`Type: ${event.eventType}`);
      console.log("---");
    });
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
