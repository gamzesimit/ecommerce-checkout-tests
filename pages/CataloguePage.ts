import { Page, expect, Locator } from '@playwright/test';

export function parsePrice(text: string): number {
  return Number((text || '').replace(/[^0-9.]/g, ''));
}

export class CataloguePage {
  constructor(private readonly page: Page) {}

  async goto() { await this.page.goto('/inventory.html'); }

  items(): Locator { return this.page.locator('[data-test="inventory-item"]'); }

  async names(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allInnerTexts();
  }

  async prices(): Promise<number[]> {
    const texts = await this.page.locator('[data-test="inventory-item-price"]').allInnerTexts();
    return texts.map(parsePrice);
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.page.selectOption('[data-test="product-sort-container"]', option);
  }

  async addToCart(productName: string) {
    const row = this.page.locator('[data-test="inventory-item"]', { hasText: productName });
    await row.locator('button', { hasText: 'Add to cart' }).click();
  }

  async priceOf(productName: string): Promise<number> {
    const row = this.page.locator('[data-test="inventory-item"]', { hasText: productName });
    return parsePrice(await row.locator('[data-test="inventory-item-price"]').innerText());
  }

  async cartCount(): Promise<number> {
    const badge = this.page.locator('[data-test="shopping-cart-badge"]');
    return (await badge.count()) ? Number(await badge.innerText()) : 0;
  }

  async openCart() { await this.page.click('[data-test="shopping-cart-link"]'); }

  async expectLoaded() {
    await expect(this.page.locator('[data-test="inventory-list"]')).toBeVisible();
  }
}
