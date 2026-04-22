/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();

  const settings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
  if (!settings) {
    await prisma.siteSettings.create({
      data: {
        portalName: "VETA Application Portal",
        heroTitle: "Omba mafunzo ya ufundi stadi",
        heroDescription:
          "Jisajili kwa jina, barua pepe, namba ya simu na neno la siri. Kisha jaza fomu ya maombi hatua kwa hatua na ufuatilie status.",
        ctaText: "Anza maombi",
        primaryTheme: "sky",
        sidebarTheme: "light",
        headerTheme: "default",
      },
    });
    console.log("Created default SiteSettings.");
  } else {
    console.log("SiteSettings already exists, skipping.");
  }

  const courseCount = await prisma.course.count();
  if (courseCount === 0) {
    await prisma.course.createMany({
      data: [
        { title: "Ufundi Umeme", sortOrder: 1, isActive: true },
        { title: "Ufundi Bomba", sortOrder: 2, isActive: true },
        {
          title: "Ubunifu / Ushonaji wa Teknolojia ya Nguo",
          sortOrder: 3,
          isActive: true,
        },
      ],
    });
    console.log("Created default courses.");
  } else {
    console.log("Courses already exist, skipping.");
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
