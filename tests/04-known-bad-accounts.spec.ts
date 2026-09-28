import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CataloguePage } from '../pages/CataloguePage';
import { USERS } from '../fixtures/users';

/**
 * The application publishes accounts that behave badly on purpose. They are
 * used here the way a real suite uses a staging flag: to prove the tests catch
 * the fault rather than reporting green through it.
 */
test.describe('Accounts that behave badly on purpose', () => {
  test('the suite notices when product images are wrong', async ({ page }) => {
    test.fail(); // SD-001
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.problem.username, USERS.problem.password);

    const catalogue = new CataloguePage(page);
    await catalogue.expectLoaded();
    const sources = await page
      .locator('.inventory_item_img img')
      .evaluateAll((els: any[]) => els.map((e) => e.getAttribute('src')));
    const distinct = new Set(sources);
    expect(distinct.size, 'every product must carry its own image').toBeGreaterThan(1);
  });

  test('the suite notices when adding to the cart stops working', async ({ page }) => {
    test.fail(); // SD-002
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.problem.username, USERS.problem.password);

    const catalogue = new CataloguePage(page);
    await catalogue.addToCart('Sauce Labs Fleece Jacket');
    expect(await catalogue.cartCount(), 'the badge must count the item that was added').toBe(1);
  });

  test('a slow account still finishes inside the agreed budget', async ({ page }) => {
    const budgetMs = 10_000;
    const started = Date.now();
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.slow.username, USERS.slow.password);
    const catalogue = new CataloguePage(page);
    await catalogue.expectLoaded();
    const elapsed = Date.now() - started;
    expect(elapsed, `signing in took ${elapsed} ms`).toBeLessThan(budgetMs);
  });
});
