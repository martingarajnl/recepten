/* Optioneel bouwscript voor wie Node.js heeft.
   Gebruik: node tools/bouw.js
   Maakt index.html, 404.html, sitemap.xml en alle receptpagina's opnieuw aan
   uit recepten.js. Het beheerformulier doet precies hetzelfde in de browser. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.resolve(__dirname, "..");
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "recepten.js"), "utf8"), ctx);
const B = require(path.join(root, "bouw.js")).init(ctx.GARAJ_DATA);
const bestanden = B.alleBestanden();
delete bestanden["recepten.js"];
for (const [pad, inhoud] of Object.entries(bestanden)) {
  const doel = path.join(root, pad);
  fs.mkdirSync(path.dirname(doel), { recursive: true });
  fs.writeFileSync(doel, inhoud);
  console.log("geschreven:", pad);
}
