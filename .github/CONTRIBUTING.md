# Contribution Guide

## Pull Request
- Please ensure your PR passes the [pr-check pipeline](https://github.com/ValueMelody/melody-auth/blob/main/.github/workflows/pr-check.yml)
- If you are adding a new feature to server project
  - Please update the "Feature Supported" section of the [README.md](https://github.com/ValueMelody/melody-auth?tab=readme-ov-file#features-supported)
  - Please add a detailed description for this feature to [docs/auth-server.md](https://github.com/ValueMelody/melody-auth/blob/main/docs/auth-server.md)
  - Include tests covering various edge cases for the new feature. Refer to the existing test structure [here](https://github.com/ValueMelody/melody-auth/tree/main/server/src/__tests__/normal)