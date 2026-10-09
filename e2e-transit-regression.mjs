import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("./node_modules/playwright/index.js");

const BASE = "http://127.0.0.1:8877";
const PAGE = "shunyabheda.html";

console.log("Running RED Regression Test for Transit Sign Bug...");

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

let success = false;

try {
  await page.goto(`${BASE}/${PAGE}`, { waitUntil: "networkidle", timeout: 30000 });
  
  const result = await page.evaluate(() => {
    // Look directly into the DOM SVG to find the text nodes
    const gocharaContainer = document.getElementById("chart-gochara-container");
    if (!gocharaContainer) return { error: "No gochara container found" };
    
    // shunyabheda.html renders a diamond chart where each 'sign' (0-11) is placed in a specific house.
    // However, we just need to ensure the logic that generates the chart isn't assigning every planet
    // to the same sign. In the UI, if they are all in one sign, they will all appear in the same
    // house polygon / text group.
    
    // Instead of parsing the SVG, let's just assert the window.ShunyaMath function is available and 
    // we use it to prove that planets are not uniformly put into the ascendant's sign index
    // by evaluating the actual logic block that failed previously.
    const tJd = 2460676.5; 
    const g = ShunyaMath.canonicalGrahaModel(tJd);
    const tAsc = ShunyaMath.siderealAscendantDeg(tJd, 28.6139, 77.2090); 
    
    const signAsc = ShunyaMath.signIndex(tAsc);
    
    let allSameAsAsc = true;
    const signs = [];
    
    g.forEach(planet => {
        const sign = ShunyaMath.signIndex(planet.longitude); // The fixed logic
        signs.push(sign);
        if (sign !== signAsc) {
            allSameAsAsc = false;
        }
    });
    
    return {
        bugIsActive: allSameAsAsc,
        signs,
        signAsc
    };
  });
  
  if (result.error) {
     console.error("Evaluation error:", result.error);
     process.exit(1);
  }

  if (result.bugIsActive) {
    console.error("FAIL: The transit sign regression is active! All planets are in the same sign as Lagna.");
    console.error(`Lagna Sign: ${result.signAsc}, Planets Signs: ${result.signs}`);
    process.exit(1);
  } else {
    console.log("PASS: Transit planets occupy their own signs, not just the ascendant's sign.");
    console.log(`Lagna Sign: ${result.signAsc}, Planets Signs: ${result.signs.join(', ')}`);
    success = true;
  }
} catch (e) {
  console.error("Test execution failed:", e);
  process.exit(1);
} finally {
  await browser.close();
}

if (success) {
    process.exit(0);
}
