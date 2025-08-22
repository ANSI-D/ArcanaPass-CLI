#!/usr/bin/env node

const crypto = require('crypto');
const readline = require('readline');

// Same deterministic password generation function as the web app
function generatePassword(site, username, masterPassword) {
  // Combine all inputs
  const input = `${masterPassword}:${username}@${site}`;
  
  // Use Node.js crypto to generate a hash
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  
  // Convert to alphanumeric password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  
  // Use chunks of the hex hash to generate password characters
  for (let i = 0; i < 16; i++) {
    const chunk = hash.substr(i * 4, 4);
    const num = parseInt(chunk, 16);
    password += chars[num % chars.length];
  }
  
  // Add some special characters for complexity
  const specials = '!@#$%^&*';
  const specialIndex1 = parseInt(hash.substr(0, 8), 16) % specials.length;
  const specialIndex2 = parseInt(hash.substr(8, 8), 16) % specials.length;
  const insertPos1 = parseInt(hash.substr(16, 8), 16) % password.length;
  const insertPos2 = parseInt(hash.substr(24, 8), 16) % (password.length + 1);
  
  // Insert first special character
  let result = password.slice(0, insertPos1) + specials[specialIndex1] + password.slice(insertPos1);
  
  // Insert second special character (adjust position since string is now longer)
  const adjustedPos2 = insertPos2 <= insertPos1 ? insertPos2 : insertPos2 + 1;
  result = result.slice(0, adjustedPos2) + specials[specialIndex2] + result.slice(adjustedPos2);
  
  return result;
}

// Hide input for master password
function hiddenInput(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Hide the input
    const stdin = process.stdin;
    stdin.on('data', (char) => {
      char = char + '';
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.pause();
          break;
        default:
          process.stdout.write('\b \b');
          break;
      }
    });
    
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Regular input for non-sensitive data
function regularInput(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log('\n🔐 ArcanaPass CLI - Stateless Password Generator\n');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  let site, username, masterPassword;
  
  // Check for command line arguments
  if (args.length >= 2) {
    site = args[0];
    username = args[1];
    
    if (args.length >= 3) {
      masterPassword = args[2];
      console.log('⚠️  Warning: Master password provided via command line is visible in shell history!');
    }
  }
  
  try {
    // Get inputs if not provided via command line
    if (!site) {
      site = await regularInput('Site/App Name: ');
    } else {
      console.log(`Site/App Name: ${site}`);
    }
    
    if (!username) {
      username = await regularInput('Username/Email: ');
    } else {
      console.log(`Username/Email: ${username}`);
    }
    
    if (!masterPassword) {
      masterPassword = await hiddenInput('Master Password: ');
      console.log(); // New line after hidden input
    }
    
    // Validate inputs
    if (!site || !username || !masterPassword) {
      console.error('❌ All fields are required!');
      process.exit(1);
    }
    
    // Generate password
    const password = generatePassword(site, username, masterPassword);
    
    console.log('\n✅ Generated Password:');
    console.log(`📋 ${password}\n`);
    
    // Copy to clipboard if available (optional)
    try {
      const { spawn } = require('child_process');
      const platform = process.platform;
      
      let clipboardCmd;
      if (platform === 'darwin') {
        clipboardCmd = spawn('pbcopy');
      } else if (platform === 'linux') {
        clipboardCmd = spawn('xclip', ['-selection', 'clipboard']);
      } else if (platform === 'win32') {
        clipboardCmd = spawn('clip');
      }
      
      if (clipboardCmd) {
        clipboardCmd.stdin.write(password);
        clipboardCmd.stdin.end();
        console.log('📎 Password copied to clipboard!');
      }
    } catch (error) {
      console.log('ℹ️  Clipboard not available, password displayed above.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Help text
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔐 ArcanaPass CLI - Stateless Password Generator

Usage:
  arcanapass                           # Interactive mode
  arcanapass <site> <username>         # Prompt for master password
  arcanapass <site> <username> <master> # All arguments (not recommended)

Examples:
  arcanapass
  arcanapass github.com john@example.com
  arcanapass "My Bank" "john@example.com"

Options:
  -h, --help    Show this help message

Note: Providing master password via command line is not recommended
as it will be visible in shell history.
`);
  process.exit(0);
}

// Run the CLI
if (require.main === module) {
  main();
}

module.exports = { generatePassword };
