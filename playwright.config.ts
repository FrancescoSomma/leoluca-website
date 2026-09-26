import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://localhost:4321",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // verify.sh esegue `astro build` prima di questo step: qui si serve
    // solo il dist/ già pronto, senza ricostruirlo.
    command: "npm run preview",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    // Astro rileva un chiamante agentico e farebbe partire `preview` in
    // background, terminando subito il processo: Playwright lo leggerebbe
    // come un crash. Questa variabile disattiva quel rilevamento.
    env: { ASTRO_PREVIEW_BACKGROUND: "1" },
  },
});
