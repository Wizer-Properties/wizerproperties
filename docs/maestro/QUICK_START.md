# Maestro Quick Start Guide

Get started with Maestro testing for WizerProperties in 5 minutes.

## Installation

```bash
# macOS
curl -Ls "https://get.maestro.mobile.dev" | bash

# Or using Homebrew
brew tap mobile-dev-inc/tap
brew install maestro
```

## Quick Test Run

1. **Start your Django development server**:
   ```bash
   cd src
   python manage.py runserver
   # Or with Docker:
   # docker compose -f docker-compose-dev.yml up
   ```

2. **Set up environment variables**:
   ```bash
   export BASE_URL="http://localhost:8000"
   export DEVELOPER_EMAIL="your-dev@example.com"
   export DEVELOPER_PASSWORD="your-password"
   export DEVELOPER_USER_ID="1"
   ```

3. **Run the simple test** (Maestro auto-detects web from `appId: web`):
   ```bash
   maestro test docs/maestro/developer-flow-simple.yaml
   ```

4. **Run the full test suite**:
   ```bash
   maestro test docs/maestro/developer-flow.yaml
   ```

5. **Run the web-optimized test**:
   ```bash
   maestro test docs/maestro/developer-flow-web.yaml
   ```

6. **Run in headless mode** (no browser window):
   ```bash
   maestro test docs/maestro/developer-flow-simple.yaml --headless
   ```

## Common Commands

```bash
# Basic test run (auto-detects web from appId: web)
maestro test docs/maestro/developer-flow-simple.yaml

# Run with environment variables
maestro test docs/maestro/developer-flow.yaml \
  -e BASE_URL="http://localhost:8000" \
  -e DEVELOPER_EMAIL="dev@example.com" \
  -e DEVELOPER_PASSWORD="password" \
  -e DEVELOPER_USER_ID="1"

# Run with environment file
maestro test docs/maestro/developer-flow.yaml --env-file .env

# Run in headless mode (no browser window)
maestro test docs/maestro/developer-flow.yaml --headless

# List available devices/browsers
maestro device list

# Start Maestro Studio (interactive testing)
maestro studio
```

## Troubleshooting

**Test fails at login?**
- Check credentials in environment variables
- Verify the login page text matches: "Sign in"

**Elements not found?**
- Add wait commands: `waitForAnimationToEnd` before assertions
- Make assertion optional: `optional: true`
- Use more specific selectors (ID instead of text)

**Web testing not working?**
- **Ensure `appId: web` is set** in YAML file (Maestro auto-detects web from this)
- Verify BASE_URL is correct (defaults to http://localhost:8000)
- Check that Django development server is running
- Check available browsers: `maestro device list`
- If "no devices" error: Maestro should auto-detect web browser when `appId: web` is set
- Try running with `--headless` flag if browser window issues occur

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize test scripts for your specific needs
- Add more test scenarios as needed

