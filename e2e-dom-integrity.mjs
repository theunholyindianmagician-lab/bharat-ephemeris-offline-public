import { createRequire } from "node:module";
import fs from "fs";

const require = createRequire(import.meta.url);
const { chromium } = require("./node_modules/playwright/index.js");

const BASE = "http://127.0.0.1:8877";
const PAGES = [
  "index.html",
  "museum.html",
  "library.html",
  "panchang.html",
  "shunyabheda.html",
  "shoonya_sovereign_dashboard.html",
];

console.log("Running DOM Integrity RED Test across all 6 surfaces...");

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

let allPass = true;

for (const name of PAGES) {
  try {
    await page.goto(`${BASE}/${name}`, { waitUntil: "load", timeout: 30000 });
    
    const result = await page.evaluate(() => {
        const errors = [];
        
        // 1. Every non-empty ID occurs exactly once
        const allElementsWithId = document.querySelectorAll('[id]');
        const idCounts = {};
        allElementsWithId.forEach(el => {
            if (el.id.trim() !== '') {
                idCounts[el.id] = (idCounts[el.id] || 0) + 1;
            }
        });
        for (const [id, count] of Object.entries(idCounts)) {
            if (count > 1) {
                errors.push(`Duplicate ID found: "${id}" appears ${count} times.`);
            }
        }
        
        // 2. Every skip-link target exists
        const skipLinks = document.querySelectorAll('a[href^="#"]');
        skipLinks.forEach(link => {
            const targetId = link.getAttribute('href').substring(1);
            // Ignore empty hashes or just #
            if (targetId.length > 0) {
                const targetEl = document.getElementById(targetId);
                if (!targetEl) {
                    errors.push(`Skip-link target missing: href="#${targetId}" has no matching element.`);
                }
            }
        });
        
        // 3. Museum main content resolves to exactly one element
        if (window.location.pathname.includes('museum.html')) {
            const mainContentById = document.querySelectorAll('#main-content');
            if (mainContentById.length !== 1) {
                errors.push(`Museum main content #main-content resolves to ${mainContentById.length} elements, expected exactly 1.`);
            }
        }
        
        return errors;
    });
    
    if (result.length > 0) {
        console.error(`FAIL: ${name} has DOM integrity errors:`);
        result.forEach(err => console.error(`  - ${err}`));
        allPass = false;
    } else {
        console.log(`PASS: ${name} (IDs unique, skip-links valid)`);
    }
    
  } catch (e) {
    console.error(`Test execution failed on ${name}:`, e);
    allPass = false;
  }
}

await browser.close();

if (allPass) {
    console.log("OVERALL PASS: All 6 surfaces have pristine DOM integrity.");
    process.exit(0);
} else {
    console.error("OVERALL FAIL: DOM integrity checks failed.");
    process.exit(1);
}
