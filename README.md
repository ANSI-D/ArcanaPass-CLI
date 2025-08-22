# ArcanaPass CLI

A command-line interface for the [ArcanaPass](https://github.com/ANSI-D/ArcanaPass) stateless password generator, written in Node.js. Generate secure, deterministic passwords without storing anything locally.

## Features

- 🔐 **Stateless**: No password storage - generates the same password every time with the same inputs
- 🛡️ **Secure**: Uses SHA-256 hashing with deterministic special character insertion
- 📋 **Clipboard Integration**: Automatically copies passwords to clipboard (when available)
- 🔒 **Hidden Input**: Master password input is hidden from terminal display
- 🚀 **Multiple Usage Modes**: Interactive prompts or command-line arguments

## Installation

### Global Installation (Recommended)
```bash
npm install -g arcanapass
```

### Local Usage
```bash
git clone <repository-url>
cd ArcanaPass-CLI
npm install
node cli.js
```

## Usage

### Interactive Mode
```bash
arcanapass
```

### With Arguments
```bash
# Prompt for master password (recommended)
arcanapass github.com john@example.com

# All arguments (not recommended - visible in shell history)
arcanapass github.com john@example.com myMasterPassword
```

### Help
```bash
arcanapass --help
```

## How It Works

ArcanaPass generates deterministic passwords by:

1. Combining your master password, username, and site name
2. Creating a SHA-256 hash of the combined input
3. Converting the hash to a 16-character alphanumeric password
4. Adding 2 special characters at deterministic positions

The same inputs will **always** generate the same password, making it stateless and reproducible.

## Requirements

- Node.js >= 14.0.0
- Optional clipboard utilities:
  - macOS: `pbcopy` (built-in)
  - Linux: `xclip`
  - Windows: `clip` (built-in)

## Security Notes

- ⚠️ Avoid providing the master password via command line arguments as it will be visible in shell history
- 🔒 Master password input is hidden when entered interactively
- 🛡️ No passwords are stored locally - everything is computed on-demand

## Related Projects

This CLI tool implements the same password generation algorithm as the web version: [ArcanaPass](https://github.com/ANSI-D/ArcanaPass)


