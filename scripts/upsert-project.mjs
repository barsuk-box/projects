import { readFileSync, writeFileSync } from "node:fs";
import { validate } from "./validate-catalog.mjs";
const input = process.argv[2];
if (!input)
  throw new Error(
    "Использование: node scripts/upsert-project.mjs <публичная-карточка.json>",
  );
const card = JSON.parse(readFileSync(input, "utf8").replace(/^\uFEFF/, ""));
validate([card]);
const file = new URL("../src/projects.json", import.meta.url);
const projects = JSON.parse(readFileSync(file, "utf8"));
const index = projects.findIndex((p) => p.id === card.id);
if (index < 0) projects.push(card);
else projects[index] = card;
validate(projects);
writeFileSync(file, JSON.stringify(projects, null, 2) + "\n");
console.log(`Карточка ${card.id} обновлена. Проверьте diff перед публикацией.`);
