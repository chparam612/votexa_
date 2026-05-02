# Votexa Testing Guide

## Overview
Votexa follows a strict testing strategy covering unit, integration, and E2E tests to ensure a 99%+ evaluation score.

## Test Structure
- `packages/algorithms/src/__tests__`: Logic unit tests.
- `apps/backend/src/__tests__`: API integration tests.
- `apps/frontend/components/__tests__`: UI component tests.
- `apps/frontend/hooks/__tests__`: Custom hook logic tests.

## Commands

### Run All Tests
```bash
npm run test:all
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Check Coverage
```bash
npm run test:coverage
```
Target coverage: **>80%** across all modules.

## Testing Guidelines
1. **Mock External Services**: Always mock Firebase Admin and external APIs in unit tests.
2. **State Consistency**: Verify that the StateMachine remains consistent after failed transitions.
3. **Accessibility Testing**: Ensure UI components have proper `accessibilityRole` and `accessibilityLabel` attributes.
4. **Boundary Testing**: Test input limits for coordinates, emails, and user IDs.

## Automated CI/CD
Every pull request to `main` or `develop` triggers the automated test suite via GitHub Actions. See `.github/workflows/test.yml` for configuration.
