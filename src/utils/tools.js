const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const { API_KEY, DEFAULT_PROMPT } = require('../constants');

function getImageBase64(path, image_name) {
    const imageBuffer = fs.readFileSync(path + image_name, 'base64');
    return imageBuffer;
}

const genAI  = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType
      },
    };
}

/**
 * Converti une réponse en JSON
 * @param {string} response
 * @returns {object | undefined}
 */
function convertResponseToJson(response) {
    if (typeof response !== 'string') return undefined;
    response = response.replaceAll('```json\n', '').replaceAll('\n```', '');
    return JSON.parse(response);
}

function getImageFromPrompt(prompt = undefined, image = undefined, path = undefined, mimeType = undefined) {
    if (image == undefined && (path == undefined || mimeType == undefined)) return undefined;
    if (prompt == undefined) {
        prompt = DEFAULT_PROMPT;
    }

    let filePart = undefined;

    if (image != undefined && mimeType != undefined) filePart = {
        inlineData: {
            data: image,
            mimeType: mimeType,
        }
    }

    if (path != undefined && mimeType != undefined) filePart = fileToGenerativePart(path, mimeType);

    if (filePart == undefined) return undefined;

    return model.generateContent([
        prompt,
        filePart,
    ]);
}

/**
 * 
 * @param {import('playwright').BrowserContext} browser 
 * @returns 
 */
async function isConnectedToGoogle(browser) {
    const page = await browser.newPage();
    await page.goto('https://www.google.fr', { waitUntil: 'load' })
    let is_connected = false;
    let connection_btn = page.getByLabel('Connexion');
    let connection_btn_visible = await connection_btn.isVisible();
    if (!connection_btn_visible) {
        page.close()
        return true
    }
    
    await connection_btn.click()
    await page.waitForLoadState('load');
    let another_account_exist = await anotherAccountExist(page);
    if (another_account_exist) {
        page.close()
        return false;
    }
    another_account_exist = null
    connection_btn = page.getByLabel('Connexion');
    connection_btn_visible = await connection_btn.isVisible();
    is_connected = !connection_btn_visible;
    page.close()
    if (is_connected) return false;
    return true;
}

/**
 * Vérifie si un autre compte existe
 * @param {import('playwright').Page} page 
 */
async function anotherAccountExist(page) {
    const element = page.getByRole('heading', { name: 'Sélectionner un compte' }).locator('span')
    return element.isVisible();
}

/**
 * 
 * @param {import('playwright').BrowserContext} browser 
 * @returns 
 */
async function runConnexionToGoogleAccount(browser) {
    const page = await browser.newPage();
    await page.goto('https://google.fr');
    await page.waitForLoadState('load');

    let connection_btn = page.getByLabel('Connexion');
    if (!(await connection_btn.isVisible())) return false;
    
    await connection_btn.click();
    await page.waitForLoadState('load');
    connection_btn = null
    let another_account_exist = await anotherAccountExist(page);
    if (!another_account_exist) {
        return await runNormalConnexion(page)
    } else {
        let account_deleted = await deleteCurrentAccount(page);
        if (!account_deleted) return false;
        return runConnexionToGoogleAccount(browser);
    }
}

/**
 * Lancer le processus de connexion normal
 * @param {import('playwright').Page} page 
 */
async function runNormalConnexion(page) {
    let email_input = page.getByLabel('Adresse e-mail ou téléphone');
    let next_btn = page.getByRole('button', { name: 'Suivant' });
    let email_input_visible = await email_input.isVisible();
    let next_btn_visible = await next_btn.isVisible();
    if (!email_input_visible || !next_btn_visible) return false;
    
    await email_input.fill('maboadanielemmanuel');
    await next_btn.click();
    await page.waitForLoadState('load');
    email_input = next_btn = null;
    email_input_visible = next_btn_visible = null;

    let iteration = 0
    let connexion_success = false
    while (iteration < 3) {
        let password_input = page.getByRole('textbox', { type: 'password' });
        let next_btn_2 = page.getByRole('button', { name: 'Suivant' });
        let password_input_visible = await password_input.isVisible();
        let next_btn_2_visible = await next_btn_2.isVisible();
        if (!password_input_visible || !next_btn_2_visible) return false;
        await password_input.fill('Fc98026697@#@#');
        await next_btn_2.click();
        await page.waitForLoadState('load');
        password_input_visible = password_input = next_btn_2 = next_btn_2_visible = null;

        let invalid_password_error = page.getByText('Saisissez un mot de passe')
        let invalid_password_error_visible = await invalid_password_error.isVisible();
        if (!invalid_password_error_visible) {
            invalid_password_error = invalid_password_error_visible = null;
            connexion_success = true;
            break
        }
        iteration++;
    }
    return connexion_success
}

/**
 * 
 * @param {import('playwright').Page} page 
 */
async function deleteCurrentAccount(page) {
    let delete_an_account = page.getByRole('link', { name: 'Supprimer un compte' })
    if (!(await delete_an_account.isVisible())) return false;
    await delete_an_account.click();
    await page.waitForLoadState('load');

    let delete_account_btn = await page.$('div[jsname] > ul > li:first-child');
    if (!(await delete_account_btn.isVisible())) return false;
    delete_an_account = null
    await delete_account_btn.click();
    await page.waitForLoadState('load');

    let confirm_delete_account_btn = page.getByRole('button', { name: 'Oui, supprimer' });
    let confirm_delete_account_btn_visible = await confirm_delete_account_btn.isVisible();
    if (!confirm_delete_account_btn_visible) return false;
    delete_account_btn = null
    await confirm_delete_account_btn.click();
    await page.waitForLoadState('load');
    page.close()
    return true
}

module.exports = {
    getImageFromPrompt,
    getImageBase64,
    convertResponseToJson,
    isConnectedToGoogle,
    runConnexionToGoogleAccount,
    model
}