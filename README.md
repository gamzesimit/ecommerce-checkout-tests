# Storefront checkout tests

[![tests](https://github.com/gamzesimit/ecommerce-checkout-tests/actions/workflows/tests.yml/badge.svg)](https://github.com/gamzesimit/ecommerce-checkout-tests/actions/workflows/tests.yml)

A Playwright suite for a storefront, built around the checkout arithmetic and the
promises the catalogue makes. Runs on desktop Chromium and a phone profile.

Reports: [docs/defect-reports.md](docs/defect-reports.md)

## Running it

```bash
npm ci
npx playwright install chromium
npx playwright test
npx playwright show-report
```

## What is covered

| File | Area |
|---|---|
| `tests/01-login.spec.ts` | Valid sign in, locked account, wrong password, empty form, and whether the error reveals that a username exists |
| `tests/02-catalogue.spec.ts` | Every product carries a name, description and price; all four sort orders really sort; the cart badge counts what was added |
| `tests/03-checkout-maths.spec.ts` | Item total against the lines, tax at the stated rate, total against item total plus tax, single item against a basket, order placed, postal code required |
| `tests/04-known-bad-accounts.spec.ts` | The accounts the application breaks on purpose, used to prove the suite catches faults rather than reporting green through them |

Eighteen tests across two device profiles. Two are marked as known failures with
`test.fail()` and carry the defect id they belong to.

## Why the arithmetic

A storefront can render perfectly and still charge the wrong amount. Sorting that
claims to be low to high and is not, a tax that is computed on the wrong base, a
total that does not equal its parts: none of those break a page, and all of them
reach the customer's card. Every check in `03-checkout-maths.spec.ts` recomputes
the figure from the prices on the page instead of trusting the one printed at the
bottom.

## Structure

```
pages/       page objects for sign in, catalogue and checkout
fixtures/    the published accounts and the checkout details
tests/       specs grouped by area
docs/        defect reports
```

Continuous integration runs the suite on every push and pull request, and once a
week on a schedule so a change on the hosted application is noticed without
anyone pushing.
