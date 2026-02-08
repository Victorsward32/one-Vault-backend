import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "sumitjadhav8331@gmail.com" },
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: "System Update",
        message: "Welcome to the OneVault Production-Ready Backend!",
        type: "SYSTEM",
        data: { version: "1.0.0" },
      },
      {
        userId: user.id,
        title: "Security Tip",
        message:
          "Remember to set up your Emergency Contacts for peace of mind.",
        type: "SECURITY",
        data: { flow: "emergency" },
      },
      {
        userId: user.id,
        title: "Vault Ready",
        message: "Your personal finance vault has been initialized.",
        type: "INFO",
        data: { category: "Finance" },
      },
    ],
  });

  console.log("Successfully pushed 3 notifications for sumit user.");
}

main().finally(() => prisma.$disconnect());
