import { Page, expect } from '@playwright/test';
import { parsePrice } from './CataloguePage';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async startCheckout() {
    await this.page.click('[data-test="checkout"]');
  }

  async fillDetails(firstName: string, lastName: string, postalCode: string) {
    await this.page.fill('[data-test="firstName"]', firstName);
    await this.page.fill('[data-test="lastName"]', lastName);
    await this.page.fill('[data-test="postalCode"]', postalCode);
    await this.page.click('[data-test="continue"]');
  }

  async errorMessage(): Promise<string> {
    const error = this.page.locator('[data-test="error"]');
    return (await error.count()) ? (await error.innerText()).trim() : '';
  }

  async itemTotal(): Promise<number> {
    return parsePrice(await this.page.locator('[data-test="subtotal-label"]').innerText());
  }

  async tax(): Promise<number> {
    return parsePrice(await this.page.locator('[data-test="tax-label"]').innerText());
  }

  async total(): Promise<number> {
    return parsePrice(await this.page.locator('[data-test="total-label"]').innerText());
  }

  /**
   * The prices printed against each line on the overview page. Read from the
   * text of the item list rather than a single class, because the markup of the
   * overview differs from the catalogue.
   */
  async lineItemPrices(): Promise<number[]> {
    const container = this.page.locator('.cart_list, [data-test="cart-list"]').first();
    const text = await container.innerText();
    const upToSummary = text.split(/Payment Information|Price Total/i)[0];
    return (upToSummary.match(/\$\s?\d+(?:\.\d{2})?/g) ?? []).map(parsePrice);
  }

  async finish() {
    await this.page.click('[data-test="finish"]');
  }

  async expectOrderPlaced() {
    await expect(this.page.locator('[data-test="complete-header"]')).toBeVisible();
  }
}
