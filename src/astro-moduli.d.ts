// tsc non legge i file .astro: senza questa dichiarazione i test che
// importano un componente non passano il controllo dei tipi.
declare module "*.astro" {
  const Component: import("astro/runtime/server/index.js").AstroComponentFactory;
  export default Component;
}
