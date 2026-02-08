import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.crpqdopxgbuxuodjpwwu:Victorsward%408331@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres",
    },
  },
});

async function main() {
  try {
    const notifications = await prisma.notification.findMany({ take: 1 });
    console.log("Notification Check (Direct):", notifications);
    console.log("Success: Direct connection works");
  } catch (error) {
    console.error("Error accessing Notification table (Direct):", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
