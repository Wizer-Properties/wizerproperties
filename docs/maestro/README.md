# Maestro Testing Scripts for WizerProperties

This directory contains Maestro test scripts for automated UI testing of the WizerProperties application.

## Overview

The test suite includes comprehensive tests for the developer workflow, covering:
- Authentication (login/logout)
- Dashboard navigation
- Property listing management
- Property creation and editing
- Property status toggling
- Search and filter functionality

## Prerequisites

1. **Install Maestro**: Follow the [Maestro installation guide](https://maestro.mobile.dev/getting-started/installing-maestro)

2. **Set up test environment**:
   - For mobile app: Ensure your app is built and installed on a device/simulator
   - For web testing: Configure Maestro to test web views or use a web browser automation setup

3. **Configure environment variables**:
   Create a `.env` file or set environment variables:
   ```bash
   export DEVELOPER_EMAIL="developer@example.com"
   export DEVELOPER_PASSWORD="your_password"
   export DEVELOPER_USER_ID="123"
   ```

## Test Scripts

### `developer-flow.yaml`
Comprehensive test suite for the complete developer workflow. This is the main test file covering all developer features.

### `developer-flow-simple.yaml`
Simplified version for quick smoke tests. Use this for faster feedback during development.

### `developer-flow-web.yaml`
Web-optimized version for testing the web application in mobile browsers or webviews. Includes base URL configuration.

**Test Coverage:**
- ✅ Developer login
- ✅ Dashboard statistics verification
- ✅ Property listings view
- ✅ Property card interactions
- ✅ Create new property navigation
- ✅ Property management from dashboard
- ✅ Toggle property active status
- ✅ View property details
- ✅ Search and filter properties
- ✅ Logout

## Running Tests

### For Web Testing (Django Application)

Since this is a Django web application, you'll use Maestro's web browser support. With `appId: web` in the YAML file, Maestro will automatically use the browser:

```bash
# Option 1: Basic test run (Maestro auto-detects web from appId: web)
maestro test docs/maestro/developer-flow-simple.yaml

# Option 2: Run with environment variables
maestro test docs/maestro/developer-flow-simple.yaml \
  -e BASE_URL="http://localhost:8000" \
  -e DEVELOPER_EMAIL="dev@example.com" \
  -e DEVELOPER_PASSWORD="password" \
  -e DEVELOPER_USER_ID="1"

# Option 3: Use environment file
maestro test docs/maestro/developer-flow-simple.yaml --env-file .env

# Option 4: Run in headless mode (no browser window)
maestro test docs/maestro/developer-flow-simple.yaml --headless
```

**Important**: Make sure your Django development server is running:
```bash
cd src
python manage.py runserver
# Or with Docker:
docker compose -f docker-compose-dev.yml up
```

### For Mobile App Testing (if you have a mobile app)

```bash
# Start a device/simulator first
maestro test docs/maestro/developer-flow.yaml
```

### With Environment Variables

```bash
maestro test docs/maestro/developer-flow.yaml \
  -e DEVELOPER_EMAIL="dev@example.com" \
  -e DEVELOPER_PASSWORD="password123" \
  -e DEVELOPER_USER_ID="1"
```

## Configuration

### App ID Configuration

For **mobile app testing**, set:
```yaml
appId: com.wizerproperties.app
```

For **web testing**, set:
```yaml
appId: web
```

### Base URL Configuration

If testing a web application, you may need to configure the base URL. Update the script to include:

```yaml
---
- launchApp
- runScript: |
    // Set base URL for web testing
    const baseUrl = "${BASE_URL:-http://localhost:8000}";
    window.location.href = `${baseUrl}/user/login/`;
```

## Test Data Requirements

Before running tests, ensure you have:

1. **Test Developer Account**:
   - Valid developer email and password
   - Developer user ID
   - At least one property listing (optional, for property interaction tests)

2. **Test Environment**:
   - Development server running (if testing web)
   - Database seeded with test data
   - API endpoints accessible

## Customization

### Adjusting Selectors

If UI elements change, update selectors in the YAML file:

```yaml
# Text-based selector
- tapOn: "Sign in"

# ID-based selector (more reliable)
- tapOn:
    id: "login-button"

# Index-based selector
- tapOn:
    text: "Button"
    index: 0
```

### Adding New Tests

To add new test scenarios:

1. Add a new test section with `- testName: "Your Test Name"`
2. Use Maestro commands to interact with the UI
3. Add assertions to verify expected behavior

Example:
```yaml
- testName: "New Feature Test"
- tapOn: "New Feature Button"
- assertVisible: "Expected Result"
```

## Troubleshooting

### Tests Failing Due to Timing

If elements aren't found immediately, add wait commands:

```yaml
- waitForAnimationToEnd
- assertVisible:
    text: "Element"
```

### Optional Assertions

For elements that may or may not be present:

```yaml
- assertVisible:
    text: "Optional Element"
    optional: true
```

### Debugging

Run tests with verbose output:

```bash
maestro test docs/maestro/developer-flow.yaml --debug
```

Take screenshots during test execution:

```yaml
- takeScreenshot: "screenshot-name"
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Maestro Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
      - name: Run Maestro Tests
        run: |
          maestro test docs/maestro/developer-flow.yaml \
            -e DEVELOPER_EMAIL="${{ secrets.DEVELOPER_EMAIL }}" \
            -e DEVELOPER_PASSWORD="${{ secrets.DEVELOPER_PASSWORD }}" \
            -e DEVELOPER_USER_ID="${{ secrets.DEVELOPER_USER_ID }}"
```

## Best Practices

1. **Use specific selectors**: Prefer IDs over text when possible
2. **Add waits**: Use `waitForAnimationToEnd` after navigation
3. **Make assertions optional**: Use `optional: true` for elements that may not always be present
4. **Organize tests**: Group related tests with `testName`
5. **Document changes**: Update this README when adding new tests

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro Commands Reference](https://maestro.mobile.dev/reference/commands)
- [Maestro Best Practices](https://maestro.mobile.dev/best-practices)

## Support

For issues or questions:
1. Check Maestro logs: `maestro test --debug`
2. Review test selectors match current UI
3. Verify environment variables are set correctly
4. Ensure test data is available in the environment

