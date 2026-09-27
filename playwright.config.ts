import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://localhost:4321",
  },
  // Due progetti perché a11y.spec.ts va eseguito una sola volta nel gate:
  // `npm run e2e` lo esclude, `npm run a11y` esegue solo lui. Un nuovo file
  // di spec finisce in "e2e" da solo, senza bisogno di aggiornare questa lista.
  projects: [
    {
      name: "e2e",
      testIgnore: "**/a11y.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "a11y",
      testMatch: "**/a11y.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
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
