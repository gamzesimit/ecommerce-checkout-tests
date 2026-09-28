import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { USERS } from '../fixtures/users';

test.describe('Signing in', () => {
  test('a valid customer reaches the catalogue', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard.username, USERS.standard.password);
    await login.expectOnCatalogue();
  });

  test('a locked account is refused and told why', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.lockedOut.username, USERS.lockedOut.password);
    expect(await login.errorMessage()).toMatch(/locked out/i);
  });

  test('a wrong password is refused', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard.username, 'not-the-password');
    expect(await login.errorMessage()).toMatch(/do not match/i);
  });

  test('an empty form is refused before anything is sent', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('', '');
    expect(await login.errorMessage()).toMatch(/Username is required/i);
  });

  test('the error message does not say which of the two fields was wrong', async ({ page }) => {
    // telling an attacker that the username exists is an information leak
    const login = new LoginPage(page);
    await login.goto();
    await login.login('no_such_customer', 'secret_sauce');
    const message = await login.errorMessage();
    expect(message).not.toMatch(/user (does not|doesn't) exist|unknown user/i);
  });
});
