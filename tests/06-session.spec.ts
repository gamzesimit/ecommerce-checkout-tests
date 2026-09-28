import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CataloguePage } from '../pages/CataloguePage';
import { USERS } from '../fixtures/users';

test.describe('Session and navigation', () => {
  test('the catalogue is not reachable without signing in', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page, 'a signed out visitor must not reach the catalogue').toHaveURL(
      /^(?!.*inventory)/,
    );
    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });

  test('the cart is not reachable without signing in', async ({ page }) => {
    await page.goto('/cart.html');
    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });

  test('signing out ends the session, and the back button does not restore it', async ({
    page,
  }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard.username, USERS.standard.password);
    await login.expectOnCatalogue();

    await page.click('#react-burger-menu-btn');
    await page.click('[data-test="logout-sidebar-link"]');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();

    await page.goBack();
    await expect(
      page.locator('[data-test="error"]'),
      'the back button must not restore a closed session',
    ).toBeVisible();
  });

  test('the reset link empties the cart', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard.username, USERS.standard.password);

    const catalogue = new CataloguePage(page);
    await catalogue.addToCart('Sauce Labs Backpack');
    expect(await catalogue.cartCount()).toBe(1);

    await page.click('#react-burger-menu-btn');
    await page.click('[data-test="reset-sidebar-link"]');
    await page.click('#react-burger-cross-btn');
    await page.reload();

    expect(await catalogue.cartCount(), 'reset must clear the cart').toBe(0);
  });
});
