/* eslint-disable @typescript-eslint/no-require-imports */
const { Prisma } = require("@prisma/client");

console.log("Prisma models:", Object.values(Prisma.ModelName).join(", "));

