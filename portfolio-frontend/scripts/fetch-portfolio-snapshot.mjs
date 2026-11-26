import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = "https://portfoliome-ge50.onrender.com/api";
const OUTPUT_PATH = path.resolve(__dirname, "../src/data/portfolioSnapshot.json");

const REQUEST_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 5_000;

async function fetchWithRetry(endpoint) {
  const url = `${API_BASE}/${endpoint}`;
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      console.log(`[snapshot] Fetching ${url} (attempt ${attempt}/${MAX_RETRIES})...`);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      clearTimeout(timer);
      return data;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      console.warn(`[snapshot] Attempt ${attempt} failed for ${endpoint}: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  throw lastError;
}

async function main() {
  const [projects, skills, experience, about, socials] = await Promise.all([
    fetchWithRetry("projects/"),
    fetchWithRetry("skills/"),
    fetchWithRetry("experience/"),
    fetchWithRetry("about/"),
    fetchWithRetry("socials/"),
  ]);

  const snapshot = {
    projects,
    skills,
    experience,
    about,
    socials,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  console.log(
    `[snapshot] Saved to ${OUTPUT_PATH} (${projects.length} projects, ${skills.length} skills, ${experience.length} experience, ${socials.length} socials)`
  );
}

main().catch((err) => {
  console.error("[snapshot] Failed to fetch portfolio snapshot:", err);
  process.exit(1);
});
