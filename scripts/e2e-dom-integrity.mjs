import { chromium } from 'playwright';

async function runTest() {
    const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
    
    // We check all HTML files
    const pagesToCheck = [
        'http://127.0.0.1:8877/index.html',
        'http://127.0.0.1:8877/shunyabheda.html',
        'http://127.0.0.1:8877/museum.html',
        'http://127.0.0.1:8877/library.html',
        'http://127.0.0.1:8877/panchang.html',
        'http://127.0.0.1:8877/shoonya_sovereign_dashboard.html'
    ];
    
    const failures = [];
    
    for (const url of pagesToCheck) {
        const page = await browser.newPage();
        const pageErrors = [];
        const consoleErrors = [];
        page.on('pageerror', error => pageErrors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
        if (!response || !response.ok()) failures.push(`${url}: HTTP ${response?.status() ?? 'no response'}`);
        
        const duplicates = await page.evaluate(() => {
            const ids = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
            const seen = new Set();
            const dups = new Set();
            for (const id of ids) {
                if (seen.has(id)) dups.add(id);
                seen.add(id);
            }
            return Array.from(dups);
        });
        
        if (duplicates.length > 0) {
            console.error(`[FAIL] Duplicate IDs on ${url}:`, duplicates);
            failures.push(`${url}: duplicate IDs ${duplicates.join(', ')}`);
        }
        const identity = await page.evaluate(() => ({
            title: document.title.trim(),
            h1: document.querySelectorAll('h1').length,
            textLength: document.body?.innerText.trim().length || 0,
        }));
        if (!identity.title || identity.h1 !== 1 || identity.textLength < 40) failures.push(`${url}: invalid page identity ${JSON.stringify(identity)}`);
        if (pageErrors.length) failures.push(`${url}: page errors ${pageErrors.join('; ')}`);
        if (consoleErrors.length) failures.push(`${url}: console errors ${consoleErrors.join('; ')}`);
        await page.close();
    }
    
    await browser.close();
    
    if (failures.length > 0) {
        console.error(`[FAIL] E2E DOM Integrity:\n${failures.join('\n')}`);
        process.exit(1);
    } else {
        console.log(JSON.stringify({ status: 'PASS', tests: pagesToCheck.length, pages: pagesToCheck.length }));
        process.exit(0);
    }
}

runTest();
