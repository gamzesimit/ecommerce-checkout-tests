# Contributing

## Running the suite

```bash
npm ci
npx playwright install chromium
npx playwright test
```

## How a test is written here

1. Recompute the number. Never assert that the total equals the total the page
   printed. Add the lines up and compare.
2. Wait for the thing the test needs, never for a fixed number of seconds.
   Asserting on an element that has not rendered yet passes for the wrong reason.
3. Put selectors in a page object. A spec with a selector in it breaks when the
   markup moves.
4. A rule this build breaks is marked with `test.fail()` and carries the defect
   id, with a second test beside it pinning the present behaviour so a fix shows
   up as a failing test.
5. Check the negative case after a navigation, not before it. An assertion that
   an element is absent will pass while the page is still loading.

## Formatting

```bash
npm run format
```

Formatting is checked in continuous integration.

## Reporting a defect

Add it to `docs/defect-reports.md` in the shape used by the entries there:
steps, result, expected, impact, and the test that covers it.
