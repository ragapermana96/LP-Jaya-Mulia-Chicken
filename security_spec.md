# Security Specification

## Data Invariants
1. Products can be read by anyone.
2. Products can only be created/updated/deleted by authorized admins.
3. Admin records can only be managed by existing admins (or initial bootstrap).

## Dirty Dozen Payloads
1. User tries to create product (FAIL - Not admin)
2. User tries to delete product (FAIL - Not admin)
3. User tries to update product price (FAIL - Not admin)
4. Anonymous user tries to list products (SUCCESS)
5. Admin tries to create product with invalid price string (FAIL - Validaton)
6. Admin tries to update product with ghost field (FAIL - hasOnly)
7. Non-admin tries to read admin document (FAIL)
8. User tries to create admin document (FAIL - Not admin)
9. User tries to inject long product ID (FAIL - isValidId)
10. Admin creates product with all fields (SUCCESS)
11. Admin updates product description only (SUCCESS)
12. User tries to update product with terminal state (N/A for product, but good practice)

## Test Runner (firestore.rules.test.ts)
(To be implemented via test suite, placeholder here)
