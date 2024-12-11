import { Builder, By, Key, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';
import { describe, it } from 'mocha';

const browserurl = 'http://localhost:5173/';

//  npx mocha test/Seleniumtest.js

// describe('admin Login ', function () {
//     it('TC_automation_001 - should login with valid credentials and redirect to home', async function () {
//         this.timeout(10000); // Extend test timeout to 10 seconds



//         const driver = new Builder()
//             .forBrowser('chrome')
//             .setChromeOptions(new chrome.Options())
//             .build();

//         try {
//             await driver.get(browserurl + "AdminLogin");
//             console.log("Navigated to login page");

//             const patientEmailField = await driver.findElement(By.id("username"));

//             const patientPasswordField = await driver.findElement(By.id("password"));

//             const patientLoginButton = await driver.findElement(By.id("loginButton"));

//             await patientEmailField.sendKeys("admin");
//             await patientPasswordField.sendKeys("admin");
//             await patientLoginButton.click();

//             // Wait for redirection
//             await driver.wait(until.urlIs(browserurl + "dashboard"), 10000);

//             // Verify successful login
//             const patientURL = await driver.getCurrentUrl();
//             assert.ok(patientURL.includes("dashboard"), 'Patient login did not redirect to home');
//         } finally {
//             await driver.quit();
//         }
//     });
// });


// describe('Forget Password', function () {
//     it('TC_automation_002 - should trigger OTP input field after submitting email', async function () {
//         this.timeout(10000);

//         const driver = new Builder()
//             .forBrowser('chrome')
//             .setChromeOptions(new chrome.Options())
//             .build();
//         try {
//             await driver.get(browserurl + "Forget_pass");

//             // Locate and interact with the form
//             const patientEmailField = await driver.findElement(By.id("emailinput"));
//             const patientSubmitButton = await driver.findElement(By.id("submitbtn"));

//             // Input email and submit
//             await patientEmailField.sendKeys("johnx3216@gmail.com");
//             await patientSubmitButton.click();

//             // Wait for the OTP input field to be visible
//             const otpInputField = await driver.wait(until.elementLocated(By.id("inputotp")), 10000);
//             await driver.wait(until.elementIsVisible(otpInputField), 10000);

//             // Assert that the OTP input field is shown
//             const isDisplayed = await otpInputField.isDisplayed();
//             assert.ok(isDisplayed, 'OTP input field was not displayed after submitting email');
//         } finally {
//             await driver.quit();
//         }
//     });
// });

describe('create patient account', function () {
    it('TC_automation_002 - should trigger OTP input field after submitting email', async function () {
        this.timeout(10000);

        const driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(new chrome.Options())
            .build();

        try {

            await driver.get(browserurl + "AdminLogin");
            console.log("Navigated to login page");

            // Locate and fill the login form
            const patientEmailField = await driver.findElement(By.id("username"));
            const patientPasswordField = await driver.findElement(By.id("password"));
            const patientLoginButton = await driver.findElement(By.id("loginButton"));

            await patientEmailField.sendKeys("admin");
            await patientPasswordField.sendKeys("admin");
            await patientLoginButton.click();
            console.log("Logged in successfully");
            
            await driver.wait(until.urlContains("dashboard"), 10000);


            await driver.wait(until.urlContains("patients-manage"), 10000);

            // Wait for the button to be clickable
            const createButton = await driver.findElement(By.id("create_patient"));
            await driver.wait(until.elementIsVisible(createButton), 5000);
            await driver.wait(until.elementIsEnabled(createButton), 5000);

            // Click the button
            await createButton.click();

            // Locate and interact with the form
            // await driver.wait(until.elementLocated(By.id("LastName")), 10000);
            const LastName = await driver.findElement(By.id("LastName"));
            await lastNameElement.sendKeys("bond");
            const FirstName = await driver.findElement(By.id("FirstName"));
            await FirstName.sendKeys("james");
            const MiddleName = await driver.findElement(By.id("MiddleName"));
            await MiddleName.sendKeys("");
            const Email = await driver.findElement(By.id("Email"));
            await Email.sendKeys("Email");
            const PhoneNumber = await driver.findElement(By.id("PhoneNumber"));
            await PhoneNumber.sendKeys("09121231234");
            const Address = await driver.findElement(By.id("Address"));
            await Address.sendKeys("bustos bulacan");
            const Gender = await driver.findElement(By.id("Gender"));
            await Gender.sendKeys("Male");
            const Age = await driver.findElement(By.id("Age"));
            await Age.sendKeys("11/12/2001");
            const Zipcode = await driver.findElement(By.id("Zipcode"));
            await Zipcode.sendKeys("Zipcode");
            const agreementCheckbox = await driver.findElement(By.id("agreement"));
            const isChecked = await agreementCheckbox.isSelected();
            if (!isChecked) {
                await agreementCheckbox.click();
            }
            const isNowChecked = await agreementCheckbox.isSelected();

            

            // Wait for the OTP input field to be visible
            const otpInputField = await driver.wait(until.elementLocated(By.id("inputotp")), 10000);
            await driver.wait(until.elementIsVisible(otpInputField), 10000);

            // Assert that the OTP input field is shown
            const isDisplayed = await otpInputField.isDisplayed();
            assert.ok(isDisplayed, 'OTP input field was not displayed after submitting email');
        } finally {
            await driver.quit();
        }
    });
});