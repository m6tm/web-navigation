const { chromium } = require('playwright');
const fs = require('fs');
const { isConnectedToGoogle, runConnexionToGoogleAccount } = require('./utils/tools');

const storageDirectory = './sessionStorage';
const userToken = 'user_token_01';
const userSessionDirectory = `${storageDirectory}/${userToken}`;

(async () => {
    if (!fs.existsSync(userSessionDirectory)) {
        fs.mkdirSync(userSessionDirectory, { recursive: true });
    }

    // Lance un navigateur Chromium
    const browser = await chromium.launchPersistentContext(userSessionDirectory, {
        headless: false,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-proxy-server',
            '--start-maximized',
        ],
        hasTouch: true,
        viewport: null,
        locale: 'fr-FR',
        geolocation: { latitude: 48.8566, longitude: 2.3522 },
        permissions: ['geolocation'],
        extraHTTPHeaders: {
          'X-Forwarded-For': 'FR'
        }
    });
    
    /**
     * @type {import('playwright').Page}
     */
    let page;
    if (browser.pages().length > 0) {
        page = browser.pages().at(-1);
    } else {
        page = await browser.newPage();
    }
    
    // Navigue vers une URL
    await page.goto('https://google.fr');
    await page.waitForLoadState('load');

    // Vérifier si le bouton existe
    const button = page.getByRole('button', { name: 'Tout accepter' });
    if (await button.isVisible()) {
        await button.click();
    }

    const change_to_frensh = page.getByRole('link', { name: 'Français' });
    if (await change_to_frensh.isVisible()) {
        await change_to_frensh.click();
        await page.waitForLoadState('load');
    }

    let is_connected = await isConnectedToGoogle(browser);
    console.log('before', is_connected);
    if (!is_connected) {
        is_connected = await runConnexionToGoogleAccount(browser)
    }
    console.log('after', is_connected);
    await page.pause();

    // Ferme le navigateur
    await browser.close();
})();
