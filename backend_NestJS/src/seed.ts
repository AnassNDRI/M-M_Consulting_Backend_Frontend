/*import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seed() {
  const roles = [
    { title: 'Administrator', actif: true },
    { title: 'Consultant', actif: true },
    { title: 'Candidat', actif: true },
    { title: 'Recruiter', actif: true },
  ];

  for (const role of roles) {
    const roleExists = await prisma.roles.findUnique({
      where: { title: role.title },
    });

    if (!roleExists) {
      await prisma.roles.create({
        data: role,
      });
      console.log(`Role ${role.title} created.`);
    } else {
      console.log(`Role ${role.title} already exists.`);
    }
  }
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  */