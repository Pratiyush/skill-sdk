# Testing Patterns

## Framework-specific patterns

### Vitest (default)

```typescript
import { describe, it, expect, vi } from "vitest";

// Mock a module
vi.mock("./database", () => ({
  query: vi.fn().mockResolvedValue([{ id: 1 }]),
}));

// Setup / teardown
beforeEach(() => { /* reset state */ });
afterEach(() => { vi.restoreAllMocks(); });
```

### Jest

```typescript
// Mock a module
jest.mock("./database", () => ({
  query: jest.fn().mockResolvedValue([{ id: 1 }]),
}));

// Setup / teardown
beforeEach(() => { /* reset state */ });
afterEach(() => { jest.restoreAllMocks(); });
```

### Mocha + Chai

```typescript
import { expect } from "chai";
import sinon from "sinon";

// Mock with sinon
const stub = sinon.stub(db, "query").resolves([{ id: 1 }]);

// Setup / teardown
beforeEach(() => { /* reset state */ });
afterEach(() => { sinon.restore(); });
```

## Common patterns

### Arrange-Act-Assert

```typescript
it("should calculate total", () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];

  // Act
  const total = calculateTotal(items);

  // Assert
  expect(total).toBe(30);
});
```

### Async testing

```typescript
it("should fetch data", async () => {
  const data = await fetchUser("user-1");
  expect(data.name).toBeDefined();
});
```

### Error testing

```typescript
it("should throw on invalid input", () => {
  expect(() => validate(null)).toThrow("Input required");
});
```
