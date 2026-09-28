# Defect reports

Application under test: Swag Labs, a storefront published as a practice target.
Tested September 2026, Chromium and a Pixel 7 profile.

The application ships accounts that behave badly on purpose. That makes it a
useful place to prove a suite catches faults instead of reporting green through
them, which is what the reports below record.

---

## SD-001 — Product images are wrong for one class of account

**Severity:** High
**Account:** `problem_user`
**Status:** Reproducible on every attempt

**Steps**

1. Sign in as `problem_user`.
2. Look at the catalogue.

**Result**
Every product carries the same image. A customer choosing between a backpack and
a t-shirt sees the same picture on both.

**Expected**
Each product carries its own image, whichever account is signed in.

**Impact**
Customers order the wrong thing, and the returns that follow cost more than the
order. A test that only checks that an image element exists would pass here,
which is why the check compares the set of image sources instead.

**Covered by** `tests/04-known-bad-accounts.spec.ts`, "the suite notices when
product images are wrong".

---

## SD-002 — Adding to the cart silently does nothing for one class of account

**Severity:** High
**Account:** `problem_user`
**Status:** Reproducible for specific products

**Steps**

1. Sign in as `problem_user`.
2. Add "Sauce Labs Fleece Jacket" to the cart.

**Result**
The button changes state but the cart badge stays empty. Nothing tells the
customer the item was not added.

**Expected**
The badge counts the item, or the customer is told the item could not be added.

**Impact**
An abandoned basket that looks like a customer changing their mind. It is
invisible in the funnel report because nothing was ever recorded.

**Covered by** `tests/04-known-bad-accounts.spec.ts`, "the suite notices when
adding to the cart stops working".

---

---

## SD-003 - An empty cart is checked out and the order is confirmed

**Severity:** Medium
**Area:** Cart and checkout
**Status:** Reproducible on every attempt

**Steps**

1. Sign in and add nothing to the cart.
2. Open the cart and press Checkout.
3. Fill in the name and postal code and continue.
4. Press Finish.

**Result**
The overview page shows a total of $0.00 and the store answers
"Thank you for your order!" on `checkout-complete.html`.

**Expected**
Checkout is not offered for an empty cart, or the customer is told the cart is
empty before the order is placed.

**Impact**
Every empty order that reaches the order system has to be cleaned out of it by
hand, and an order count that includes them cannot be used to measure anything.
It also means the button that places an order does not check the one condition
that has to hold before it runs.

**Covered by** `tests/05-cart.spec.ts`, "an empty cart cannot be checked out into
a completed order", with a second test pinning the present behaviour.

## Rules that hold

- Sorting by price low to high, high to low and by name A to Z all return the
  order they promise.
- The item total equals the sum of the lines, checked both against the catalogue
  prices and against the prices printed on the overview page.
- The tax is 8 per cent of the item total, rounded to the cent.
- The total equals the item total plus the tax.
- A locked account, a wrong password and an empty form are each refused with a
  message that names the problem.
- The sign in error does not reveal whether the username exists.
- The postal code is required before checkout continues.
- An order can be placed and is confirmed.

Measured on the slow account: sign in and the catalogue render inside the ten
second budget the suite sets.
