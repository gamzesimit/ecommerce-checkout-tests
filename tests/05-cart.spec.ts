import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CataloguePage } from '../pages/CataloguePage';
import { CartPage } from '../pages/CartPage';
import { USERS } from '../fixtures/users';

test.describe('The cart', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard.username, USERS.standard.password);
  });

  test('the cart holds what was added, at the price the catalogue showed', async ({ page }) => {
    const catalogue = new CataloguePage(page);
    await catalogue.expectLoaded();
    const backpackPrice = await catalogue.priceOf('Sauce Labs Backpack');
    const lightPrice = await catalogue.priceOf('Sauce Labs Bike Light');
    await catalogue.addToCart('Sauce Labs Backpack');
    await catalogue.addToCart('Sauce Labs Bike Light');

    const cart = new CartPage(page);
    await cart.goto();
    expect(await cart.count()).toBe(2);
    expect(await cart.prices()).toEqual([backpackPrice, lightPrice]);
  });

  test('removing an item takes it out of the cart and off the badge', async ({ page }) => {
    const catalogue = new CataloguePage(page);
    await catalogue.addToCart('Sauce Labs Backpack');
    await catalogue.addToCart('Sauce Labs Bike Light');

    const cart = new CartPage(page);
    await cart.goto();
    await cart.remove('Sauce Labs Backpack');

    expect(await cart.count()).toBe(1);
    expect(await cart.names()).toEqual(['Sauce Labs Bike Light']);
    expect(await catalogue.cartCount()).toBe(1);
  });

  test('the cart survives going back to the catalogue and returning', async ({ page }) => {
    const catalogue = new CataloguePage(page);
    await catalogue.addToCart('Sauce Labs Fleece Jacket');

    const cart = new CartPage(page);
    await cart.goto();
    await cart.continueShopping();
    await catalogue.expectLoaded();
    await cart.goto();

    expect(await cart.names()).toEqual(['Sauce Labs Fleece Jacket']);
  });

  // SD-003. An empty cart walks all the way through checkout and the store
  // confirms the order for 0.00.
  test('an empty cart cannot be checked out into a completed order', async ({ page }) => {
    test.fail();
    const cart = new CartPage(page);
    await cart.goto();
    await cart.expectEmpty();
    await page.click('[data-test="checkout"]');
    await page.fill('[data-test="firstName"]', 'Qa');
    await page.fill('[data-test="lastName"]', 'Tester');
    await page.fill('[data-test="postalCode"]', '78701');
    await page.click('[data-test="continue"]');
    await page.click('[data-test="finish"]');
    await page.waitForLoadState('domcontentloaded');
    await expect(
      page,
      'an order with nothing in it must not reach the confirmation page',
    ).not.toHaveURL(/checkout-complete/);
  });

  test('SD-003 pinned: an empty cart reaches the order confirmation', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();
    await cart.expectEmpty();
    await page.click('[data-test="checkout"]');
    await page.fill('[data-test="firstName"]', 'Qa');
    await page.fill('[data-test="lastName"]', 'Tester');
    await page.fill('[data-test="postalCode"]', '78701');
    await page.click('[data-test="continue"]');
    await expect(page.locator('[data-test="total-label"]')).toContainText('$0.00');
    await page.click('[data-test="finish"]');
    await expect(page.locator('[data-test="complete-header"]')).toContainText(
      'Thank you for your order',
    );
  });
});
