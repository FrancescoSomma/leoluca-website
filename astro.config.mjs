import { defineConfig } from "astro/config";

export default defineConfig({
  // Dominio provvisorio: Leo non ha ancora scelto tra i due che possiede.
  site: "https://leolucaiacoviello.it",
  i18n: {
    defaultLocale: "it",
    locales: ["it", "en"],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },
  image: {
    // Gli originali vivono su storage a oggetti (ADR-0004). Il pattern va
    // ristretto all'host reale quando lo storage è scelto.
    remotePatterns: [{ protocol: "https" }],
  },
});
