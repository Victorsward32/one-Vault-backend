import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const notifications = await prisma.notification.findMany({ take: 1 });
    console.log("Notification Check:", notifications);
    console.log("Success: Notification table is accessible");
  } catch (error) {
    console.error("Error accessing Notification table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
