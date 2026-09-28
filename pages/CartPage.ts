import { Page, expect, Locator } from '@playwright/test';
import { parsePrice } from './CataloguePage';

export class CartPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/cart.html');
  }

  items(): Locator {
    return this.page.locator('[data-test="inventory-item"]');
  }

  async count(): Promise<number> {
    return this.items().count();
  }

  async names(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allInnerTexts();
  }

  async prices(): Promise<number[]> {
    const texts = await this.page.locator('[data-test="inventory-item-price"]').allInnerTexts();
    return texts.map(parsePrice);
  }

  async remove(productName: string) {
    const row = this.page.locator('[data-test="inventory-item"]', { hasText: productName });
    await row.locator('button', { hasText: 'Remove' }).click();
  }

  async continueShopping() {
    await this.page.click('[data-test="continue-shopping"]');
  }

  async expectEmpty() {
    await expect(this.items()).toHaveCount(0);
  }
}
