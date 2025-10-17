#!/bin/bash
set -e

VERSION="v1.0.0"
BINARY_URL="https://github.com/skillDeCoder/Idle-finance-v2-backend/releases/download/v1.0.0/backend-macos"
ENV_FILE_ID="1H8uAgVARe4GkMHNU2usNc73u39GjHndu"

echo "
######## #### ##    ## ########  #######  ##    ##          ######   ######  ########  #### ########  ######## 
   ##     ##  ##   ##     ##    ##     ## ##   ##          ##    ## ##    ## ##     ##  ##  ##     ##    ##    
   ##     ##  ##  ##      ##    ##     ## ##  ##           ##       ##       ##     ##  ##  ##     ##    ##    
   ##     ##  #####       ##    ##     ## #####    #######  ######  ##       ########   ##  ########     ##    
   ##     ##  ##  ##      ##    ##     ## ##  ##                 ## ##       ##   ##    ##  ##           ##    
   ##     ##  ##   ##     ##    ##     ## ##   ##          ##    ## ##    ## ##    ##   ##  ##           ##    
   ##    #### ##    ##    ##     #######  ##    ##          ######   ######  ##     ## #### ##           ##    
"

echo "Downloading backend... macos"
curl -L "${BINARY_URL}" -o backend

echo "Making backend executable..."
chmod +x backend

echo "Downloading .env from Google Drive..."
curl -L -o .env "https://drive.google.com/uc?export=download&id=${ENV_FILE_ID}"


echo "Running backend..."
./backend