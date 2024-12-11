import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const browserurl = 'http://localhost:5173/';


async function runTests() {
    // node selenium/Seleniumtest.js
    console.warn('start of the test');

    await loginAdmin();
    await loginStaff();
    console.warn('end of the test');

}

runTests();





async function loginAdmin() {
    
    const options = new chrome.Options();
    options.addArguments('--disable-logging', '--log-level=3'); // Suppress logging
    options.excludeSwitches(['enable-logging']); // Suppress DevTools listening message
    options.addArguments('--start-maximized');

    const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    try {
        await driver.get(`${browserurl}AdminLogin`);
        console.log('admin Login test Start!.....');

        const usernameField = await driver.wait(until.elementLocated(By.name('username')), 10000);
        await usernameField.sendKeys('admin');

        const passwordField = await driver.findElement(By.name('password'));
        await passwordField.sendKeys('admin');

        const loginButton = await driver.findElement(By.css('button[type="submit"]'));
        await loginButton.click();

        await driver.wait(until.urlContains('/dashboard'), 10000);
        console.log('✔ admin Login test passed!');
    } catch (error) {
        console.error('Login test failed:', error);
        console.log('❌ admin Login test failed.');
    } finally {
        await driver.quit();
    }
}

async function loginStaff() {
    const options = new chrome.Options();
    options.addArguments('--disable-logging', '--log-level=3');
    options.excludeSwitches(['enable-logging']);

    const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    try {
        await driver.get(`${browserurl}AdminLogin`);
        console.log('Staff Login test Start!.....');

        const usernameField = await driver.wait(until.elementLocated(By.name('username')), 10000);
        await usernameField.sendKeys('Staff');

        const passwordField = await driver.findElement(By.name('password'));
        await passwordField.sendKeys('Staff');

        const loginButton = await driver.findElement(By.css('button[type="submit"]'));
        await loginButton.click();

        await driver.wait(until.urlContains('/dashboard'), 10000);
        console.log('✔ Staff Login test passed!');
    } catch (error) {
        console.error('Login test failed:', error);
        console.log('❌ Staff Login test failed.');
    } finally {
        await driver.quit();
    }
}

