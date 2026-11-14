---
"serupa-ds": minor
---

Checkout pattern: choose how to pay, and add a promo code.

- The ways to pay are a list the app passes (`methods`), shown as radio cards with generic icons: card (saved cards, then a new card with a single MM/YY expiry field that puts in its own slash), Apple Pay and Google Pay, bank transfer to a virtual account, e-wallets and QRIS. The chosen method's questions show under the list. After the order, a bank transfer shows the account number and amount with copy buttons, an e-wallet says which app to approve in, and QRIS shows the code, each with the time left to pay and what happens when it runs out.
- "Add promo code" in the order summary opens a field with Apply. It shows a busy state while checking, an error when the code doesn't apply, and an applied code as a badge with Remove and a discount line. Each change is announced.
