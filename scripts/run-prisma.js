const { spawnSync } = require("node:child_process");

const command = process.argv[2];

if (!command) {
  console.error("Usage: node scripts/run-prisma.js <generate|db push|migrate dev>");
  process.exit(1);
}

const extraArgs = process.argv.slice(3);
const args = command.split(" ").concat(extraArgs);
const env = { ...process.env };

if (process.platform === "win32") {
  env.PRISMA_SCHEMA_ENGINE_BINARY =
    "node_modules/@prisma/engines/schema-engine-windows.exe";
  env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = "1";
}

const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env,
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
