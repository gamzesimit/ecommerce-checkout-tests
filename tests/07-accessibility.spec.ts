import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from '../pages/LoginPage';
import { CataloguePage } from '../pages/CataloguePage';
import { USERS } from '../fixtures/users';

/**
 * A storefront that cannot be used with a screen reader loses those customers
 * silently, and in several markets it is also a legal exposure. These checks
 * look for the failures that stop a page being usable at all, not for style.
 */
const BLOCKING_RULES = ['color-contrast', 'label', 'button-name', 'link-name', 'image-alt'];

async function violations(page: any) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .include('body')
    .analyze();
  return results.violations.filter((v: any) => BLOCKING_RULES.includes(v.id));
}

test.describe('Accessibility', () => {
  test('the sign in page has no blocking failures', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const found = await violations(page);
    expect(
      found.map((v: any) => v.id),
      JSON.stringify(found.map((v: any) => v.id)),
    ).toEqual([]);
  });

  test('the catalogue has no blocking failures', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard.username, USERS.standard.password);
    const catalogue = new CataloguePage(page);
    await catalogue.expectLoaded();
    const found = await violations(page);
    expect(
      found.map((v: any) => v.id),
      JSON.stringify(found.map((v: any) => v.id)),
    ).toEqual([]);
  });

  test('every product image carries alternative text', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard.username, USERS.standard.password);
    const alts = await page
      .locator('.inventory_item_img img')
      .evaluateAll((els: any[]) => els.map((e) => e.getAttribute('alt')));
    expect(alts.length).toBeGreaterThan(0);
    for (const alt of alts) {
      expect(
        alt,
        'a product image without alternative text is invisible to a screen reader',
      ).toBeTruthy();
    }
  });
});
