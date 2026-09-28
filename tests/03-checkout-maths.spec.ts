import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CataloguePage } from '../pages/CataloguePage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { USERS, CHECKOUT } from '../fixtures/users';

/** Rounded to cents the way a till rounds: half up. */
function roundCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

const TAX_RATE = 0.08;

async function checkoutWith(page: any, products: string[]) {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(USERS.standard.username, USERS.standard.password);

  const catalogue = new CataloguePage(page);
  await catalogue.expectLoaded();
  const prices: number[] = [];
  for (const product of products) {
    prices.push(await catalogue.priceOf(product));
    await catalogue.addToCart(product);
  }
  await catalogue.openCart();

  const checkout = new CheckoutPage(page);
  await checkout.startCheckout();
  await checkout.fillDetails(CHECKOUT.firstName, CHECKOUT.lastName, CHECKOUT.postalCode);
  return { checkout, prices };
}

test.describe('Checkout arithmetic', () => {
  test('the item total equals the sum of the lines', async ({ page }) => {
    const { checkout, prices } = await checkoutWith(page, [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
    ]);
    const expected = roundCents(prices.reduce((a, b) => a + b, 0));
    expect(await checkout.itemTotal()).toBe(expected);
  });

  test('the item total equals the sum of the lines shown on the same page', async ({ page }) => {
    const { checkout } = await checkoutWith(page, [
      'Sauce Labs Backpack',
      'Sauce Labs Fleece Jacket',
    ]);
    const lines = await checkout.lineItemPrices();
    expect(await checkout.itemTotal()).toBe(roundCents(lines.reduce((a, b) => a + b, 0)));
  });

  test('the total equals the item total plus the tax', async ({ page }) => {
    const { checkout } = await checkoutWith(page, ['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
    const itemTotal = await checkout.itemTotal();
    const tax = await checkout.tax();
    expect(await checkout.total()).toBe(roundCents(itemTotal + tax));
  });

  test('the tax is the stated rate of the item total, rounded to the cent', async ({ page }) => {
    const { checkout } = await checkoutWith(page, ['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
    const itemTotal = await checkout.itemTotal();
    expect(await checkout.tax()).toBe(roundCents(itemTotal * TAX_RATE));
  });

  test('a single item is taxed the same way as a basket', async ({ page }) => {
    const { checkout } = await checkoutWith(page, ['Sauce Labs Onesie']);
    const itemTotal = await checkout.itemTotal();
    expect(await checkout.tax()).toBe(roundCents(itemTotal * TAX_RATE));
    expect(await checkout.total()).toBe(roundCents(itemTotal + (await checkout.tax())));
  });

  test('the order can be placed and is confirmed', async ({ page }) => {
    const { checkout } = await checkoutWith(page, ['Sauce Labs Backpack']);
    await checkout.finish();
    await checkout.expectOrderPlaced();
  });
});

test.describe('Checkout validation', () => {
  test('the postal code is required', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard.username, USERS.standard.password);
    const catalogue = new CataloguePage(page);
    await catalogue.addToCart('Sauce Labs Backpack');
    await catalogue.openCart();
    const checkout = new CheckoutPage(page);
    await checkout.startCheckout();
    await checkout.fillDetails('Qa', 'Tester', '');
    expect(await checkout.errorMessage()).toMatch(/Postal Code is required/i);
  });
});
