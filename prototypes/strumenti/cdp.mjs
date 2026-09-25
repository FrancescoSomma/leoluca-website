// Screenshot e verifiche via Chrome DevTools Protocol, senza dipendenze.
// uso: node prototypes/strumenti/cdp.mjs lavori.json
// lavoro: { url, out?, w, h, full?, scala?, percorri?, scroll?, dopoScroll?, eval?, wait?, reduce? }
// - percorri: scorre tutta la pagina per far caricare le lazy, poi torna in cima;
// - eval: valuta un'espressione, anche una Promise, e ne stampa il risultato;
// - reduce: emula prefers-reduced-motion: reduce.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const lavori = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=0',
  '--autoplay-policy=no-user-gesture-required', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cdp-'))}`,
  'about:blank',
]);
const wsUrl = await new Promise((ok) => {
  chrome.stderr.on('data', (d) => {
    const m = String(d).match(/ws:\/\/\S+/);
    if (m) ok(m[0]);
  });
});

const ws = new WebSocket(wsUrl);
await new Promise((ok) => ws.addEventListener('open', ok));
let seq = 0;
const attese = new Map();
const ascoltatori = [];
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && attese.has(msg.id)) {
    attese.get(msg.id)(msg);
    attese.delete(msg.id);
  } else if (msg.method) {
    ascoltatori.forEach((f) => f(msg));
  }
});
const invia = (method, params = {}, sessionId) =>
  new Promise((ok, ko) => {
    const id = ++seq;
    attese.set(id, (m) => (m.error ? ko(new Error(`${method}: ${m.error.message}`)) : ok(m.result)));
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
const evento = (nome, sessionId, timeout = 20000) =>
  new Promise((ok) => {
    const f = (m) => {
      if (m.method === nome && m.sessionId === sessionId) ok(m);
    };
    ascoltatori.push(f);
    setTimeout(ok, timeout);
  });

for (const l of lavori) {
  const { targetId } = await invia('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await invia('Target.attachToTarget', { targetId, flatten: true });
  const s = (m, p) => invia(m, p, sessionId);
  await s('Page.enable');
  await s('Emulation.setDeviceMetricsOverride', { width: l.w, height: l.h, deviceScaleFactor: 1, mobile: l.w < 768 });
  if (l.reduce) {
    await s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  }
  const caricata = evento('Page.loadEventFired', sessionId);
  await s('Page.navigate', { url: l.url });
  await caricata;
  await pausa(l.wait ?? 2500);
  const valuta = async (expr) =>
    (await s('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
  if (l.percorri) {
    const alto = await valuta('document.documentElement.scrollHeight');
    for (let y = 0; y < alto; y += Math.round(l.h * 0.8)) {
      await valuta(`window.scrollTo(0, ${y})`);
      await pausa(350);
    }
    await pausa(1500);
    await valuta('window.scrollTo(0, 0)');
    await pausa(500);
  }
  if (l.scroll) {
    await valuta(typeof l.scroll === 'number' ? `window.scrollTo(0, ${l.scroll})` : l.scroll);
    await pausa(l.dopoScroll ?? 1800);
  }
  if (l.eval) {
    console.log(`${l.out ?? l.url} → ${JSON.stringify(await valuta(l.eval))}`);
  }
  if (l.out) {
    let clip;
    if (l.full) {
      const alto = await valuta('document.documentElement.scrollHeight');
      clip = { x: 0, y: 0, width: l.w, height: alto, scale: l.scala ?? 1 };
    }
    const { data } = await s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!l.full, clip });
    writeFileSync(l.out, Buffer.from(data, 'base64'));
    console.log(l.out);
  }
  await invia('Target.closeTarget', { targetId });
}
ws.close();
chrome.kill();
