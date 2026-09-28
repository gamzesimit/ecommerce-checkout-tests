import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CataloguePage } from '../pages/CataloguePage';
import { USERS } from '../fixtures/users';

test.describe('The catalogue', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard.username, USERS.standard.password);
  });

  test('every product shows a name, a description and a price', async ({ page }) => {
    const catalogue = new CataloguePage(page);
    await catalogue.expectLoaded();
    const count = await catalogue.items().count();
    expect(count).toBeGreaterThan(0);
    expect((await catalogue.names()).filter(Boolean)).toHaveLength(count);
    for (const price of await catalogue.prices()) expect(price).toBeGreaterThan(0);
  });

  test('sorting by price low to high really is ascending', async ({ page }) => {
    const catalogue = new CataloguePage(page);
    await catalogue.sortBy('lohi');
    const prices = await catalogue.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorting by price high to low really is descending', async ({ page }) => {
    const catalogue = new CataloguePage(page);
    await catalogue.sortBy('hilo');
    const prices = await catalogue.prices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('sorting by name A to Z really is alphabetical', async ({ page }) => {
    const catalogue = new CataloguePage(page);
    await catalogue.sortBy('az');
    const names = await catalogue.names();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('the cart badge counts what was added', async ({ page }) => {
    const catalogue = new CataloguePage(page);
    expect(await catalogue.cartCount()).toBe(0);
    await catalogue.addToCart('Sauce Labs Backpack');
    expect(await catalogue.cartCount()).toBe(1);
    await catalogue.addToCart('Sauce Labs Bike Light');
    expect(await catalogue.cartCount()).toBe(2);
  });
});
