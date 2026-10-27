> [!WARNING]
> **Not ready for production.** This is an early preview for internal testing: expect bugs and changes to how projects are stored. Test generated policy before it reaches real hosts.

The macOS and Linux installers aren't signed yet, so those systems ask once whether to trust them:

- **macOS** (arm64 for Apple Silicon, x64 for Intel): move the app to Applications, then run `xattr -dr com.apple.quarantine "/Applications/CFEngine Policy Builder.app"` once. Without it macOS says the app is damaged.
- **Windows**: the installer is signed by Northern.tech AS. While the publisher is new, SmartScreen may still warn: choose More info › Run anyway.
- **Linux**: the AppImage runs as is (`chmod +x`); the .deb and .rpm install with the system's package tool.

Testing policies needs Docker running; creating projects needs git.
