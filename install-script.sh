#!/bin/bash
set -e

# =========================
# Configuration
# =========================
VERSION="v1"
BINARY_URL="https://github.com/skillDeCoder/tik-script/releases/download/v1/tiktok-script"
ENV_FILE_ID="1z-amIVI1qqceUtjyGFG0JoXD-lFcpcZb"

# =========================
# ASCII banner
# =========================
echo "
######## #### ##    ## ########  #######  ##    ##          ######   ######  ########  #### ########  ######## 
   ##     ##  ##   ##     ##    ##     ## ##   ##          ##    ## ##    ## ##     ##  ##  ##     ##    ##    
   ##     ##  ##  ##      ##    ##     ## ##  ##           ##       ##       ##     ##  ##  ##     ##    ##    
   ##     ##  #####       ##    ##     ## #####    #######  ######  ##       ########   ##  ########     ##    
   ##     ##  ##  ##      ##    ##     ## ##  ##                 ## ##       ##   ##    ##  ##           ##    
   ##     ##  ##   ##     ##    ##     ## ##   ##          ##    ## ##    ## ##    ##   ##  ##           ##    
   ##    #### ##    ##    ##     #######  ##    ##          ######   ######  ##     ## #### ##           ##    
"

# =========================
# Check prerequisites
# =========================
if ! command -v curl &> /dev/null; then
    echo "curl is required but not installed. Please install curl and try again."
    exit 1
fi

# =========================
# Check/install Node.js, npm, npx
# =========================
install_node() {
    echo "Node.js not found. Installing Node.js via nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    nvm install --lts
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
    echo "Node.js and npm installed successfully."
}

if ! command -v node &> /dev/null; then
    install_node
else
    echo "Node.js is already installed."
fi

if ! command -v npm &> /dev/null; then
    echo "npm not found. Exiting."
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "npx not found. Exiting."
    exit 1
fi

echo "Node.js, npm, and npx are ready!"

# =========================
# Optional: Install Playwright Chromium
# =========================
while true; do
    read -p "Install Playwright Chromium? (y/n): " install_browser
    case "$install_browser" in
        y|Y) 
            echo "Installing Playwright Chromium..."
            npx playwright install chromium
            break
            ;;
        n|N) 
            echo "Skipping Playwright installation."
            break
            ;;
        *) 
            echo "Please enter 'y' or 'n'."
            ;;
    esac
done

# =========================
# Download binary
# =========================
echo "Downloading tikscript binary..."
curl --progress-bar -L "$BINARY_URL" -o tikscript
chmod +x tikscript

# =========================
# Download .env
# =========================
echo "Downloading .env file..."
curl --progress-bar -L -o .env "https://drive.google.com/uc?export=download&id=${ENV_FILE_ID}"

# =========================
# Finish installation
# =========================
echo "Installation complete!"
echo "You can now run the backend with:"
echo "./tikscript"