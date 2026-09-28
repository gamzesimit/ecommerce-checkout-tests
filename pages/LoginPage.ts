import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() { await this.page.goto('/'); }

  async login(username: string, password: string) {
    await this.page.fill('[data-test="username"]', username);
    await this.page.fill('[data-test="password"]', password);
    await this.page.click('[data-test="login-button"]');
  }

  async errorMessage(): Promise<string> {
    const error = this.page.locator('[data-test="error"]');
    return (await error.count()) ? (await error.innerText()).trim() : '';
  }

  async expectOnCatalogue() {
    await expect(this.page).toHaveURL(/inventory\.html/);
  }
}
