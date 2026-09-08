# Project Vibe Validator

[![CI & Code Coverage](https://github.com/elijah-chou/project-vibe-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/elijah-chou/project-vibe-validator/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/elijah-chou/project-vibe-validator/graph/badge.svg)](https://codecov.io/gh/elijah-chou/project-vibe-validator)

Sanity check your messy shower thoughts with AI.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing & Code Coverage

This project uses [Vitest](https://vitest.dev/) and [@vitest/coverage-v8](https://vitest.dev/guide/coverage.html) for fast unit testing and code coverage reporting.

### Run Tests
```bash
npm run test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Code Coverage
```bash
npm run test:coverage
```

Coverage reports are saved in the `coverage/` directory, including:
- **Terminal Summary**: Real-time console table.
- **LCOV (`coverage/lcov.info`)**: Formatted for Codecov and CI tooling.
- **HTML Report (`coverage/index.html`)**: Interactive browser view of file coverage.

## CI & Codecov Integration

A GitHub Actions workflow is configured in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) that triggers on pushes and pull requests to `main`. It:
1. Installs dependencies using `npm ci`.
2. Runs the linter (`npm run lint`).
3. Runs the test suite with coverage (`npm run test:coverage`).
4. Uploads coverage reports to [Codecov](https://about.codecov.io/) via `codecov/codecov-action@v5`.

### Configuring Codecov Token
1. Sign in to [Codecov](https://app.codecov.io/) with your GitHub account.
2. Navigate to the `project-vibe-validator` repository and copy the **Upload Token**.
3. In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
4. Create a new repository secret named `CODECOV_TOKEN` and paste your token.
