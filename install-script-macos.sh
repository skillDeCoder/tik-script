#!/bin/bash
set -e

VERSION="v1"
BINARY_URL="https://github.com/skillDeCoder/tik-script/releases/download/v1/tiktok-script"
ENV_FILE_ID="1z-amIVI1qqceUtjyGFG0JoXD-lFcpcZb"


echo "
######## #### ##    ## ########  #######  ##    ##          ######   ######  ########  #### ########  ######## 
   ##     ##  ##   ##     ##    ##     ## ##   ##          ##    ## ##    ## ##     ##  ##  ##     ##    ##    
   ##     ##  ##  ##      ##    ##     ## ##  ##           ##       ##       ##     ##  ##  ##     ##    ##    
   ##     ##  #####       ##    ##     ## #####    #######  ######  ##       ########   ##  ########     ##    
   ##     ##  ##  ##      ##    ##     ## ##  ##                 ## ##       ##   ##    ##  ##           ##    
   ##     ##  ##   ##     ##    ##     ## ##   ##          ##    ## ##    ## ##    ##   ##  ##           ##    
   ##    #### ##    ##    ##     #######  ##    ##          ######   ######  ##     ## #### ##           ##    
"
echo "Installing chromium  browser ...."

 npx playwright install chromium

echo "Downloading tikcript... macos"
curl -L "${BINARY_URL}" -o tikscript

echo "Making backend executable..."
chmod +x tikscript

echo "Downloading .env from Google Drive..."
curl -L -o .env "https://drive.google.com/uc?export=download&id=${ENV_FILE_ID}"


echo "Running tikscript..."
./tikscript
