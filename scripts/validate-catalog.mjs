import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
export function validate(projects) {
  if (!Array.isArray(projects) || !projects.length)
    throw new Error("Каталог должен содержать карточки");
  const ids = new Set();
  const fields = [
    "id",
    "title",
    "category",
    "status",
    "visual",
    "description",
    "details",
    "next",
    "tags",
    "url",
    "updated",
  ];
  for (const p of projects) {
    if (Object.keys(p).some((k) => !fields.includes(k)))
      throw new Error("Неизвестные поля карточки");
    for (const k of fields.filter((k) => !["tags", "url"].includes(k)))
      if (typeof p[k] !== "string" || !p[k].trim())
        throw new Error(`Незаполнено ${k}`);
    if (!/^[a-z0-9-]+$/.test(p.id) || ids.has(p.id))
      throw new Error(`Неверный или повторный id: ${p.id}`);
    ids.add(p.id);
    if (!["active", "released", "planned"].includes(p.status))
      throw new Error("Неверный статус");
    if (!["audio", "finance", "check", "catalog", "brand"].includes(p.visual))
      throw new Error("Неверный тип изображения");
    if (
      !Array.isArray(p.tags) ||
      !p.tags.length ||
      p.tags.some((t) => typeof t !== "string" || !t.trim())
    )
      throw new Error("Неверные теги");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(p.updated) ||
      Number.isNaN(Date.parse(p.updated))
    )
      throw new Error("Неверная дата");
    if (
      p.url !== null &&
      (typeof p.url !== "string" ||
        !p.url.startsWith("https://") ||
        new URL(p.url).username ||
        new URL(p.url).password)
    )
      throw new Error("Разрешены только HTTPS-ссылки без учётных данных");
    if (
      /(?:gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|[A-Z]:\\|BEGIN .*PRIVATE KEY)/i.test(
        JSON.stringify(p),
      )
    )
      throw new Error("Возможный секрет или локальный путь");
  }
  return projects;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const projects = validate(
    JSON.parse(
      readFileSync(new URL("../src/projects.json", import.meta.url), "utf8"),
    ),
  );
  console.log(`Проверено карточек: ${projects.length}`);
}
