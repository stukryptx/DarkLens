#!/bin/bash

echo -e "\e[34m[DarkLens]\e[0m Initializing Service Installation..."

# Get current user and home directory (to run service as the actual user, not root)
CURRENT_USER=$(whoami)
CURRENT_DIR=$(pwd)

if [ "$CURRENT_USER" = "root" ]; then
    echo -e "\e[31m[DarkLens]\e[0m Please run this script as your normal user, NOT with sudo (the script will ask for sudo when needed)."
    exit 1
fi

echo -e "\e[34m[DarkLens]\e[0m Setting up domain mapping (darklens.local)..."
if grep -q "darklens.local" /etc/hosts; then
    echo -e "\e[32m[DarkLens]\e[0m Domain already mapped in /etc/hosts."
else
    echo -e "\e[33m[DarkLens]\e[0m Requesting sudo privileges to update /etc/hosts..."
    echo "127.0.0.1 darklens.local" | sudo tee -a /etc/hosts > /dev/null
    echo -e "\e[32m[DarkLens]\e[0m Domain mapped successfully."
fi

# OS Detection
OS="$(uname -s)"
case "${OS}" in
    Linux*)     
        echo -e "\e[34m[DarkLens]\e[0m Linux detected. Creating Systemd service..."
        SERVICE_FILE="/etc/systemd/system/darklens.service"
        
        # Determine Node/NPM path to ensure service can find it
        NODE_PATH=$(which node)
        if [ -z "$NODE_PATH" ]; then
            NODE_PATH="/usr/bin/node"
        fi
        NODE_DIR=$(dirname "$NODE_PATH")

        sudo bash -c "cat > $SERVICE_FILE" <<EOL
[Unit]
Description=DarkLens Command Center
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
Environment=PATH=$NODE_DIR:/usr/local/bin:/usr/bin:/bin:/home/$CURRENT_USER/.nvm/versions/node/$(node -v 2>/dev/null || echo "none")/bin:$PATH
ExecStart=$CURRENT_DIR/start.sh
Restart=on-failure
RestartSec=10
KillMode=process

[Install]
WantedBy=multi-user.target
EOL
        echo -e "\e[34m[DarkLens]\e[0m Reloading systemd daemons..."
        sudo systemctl daemon-reload
        sudo systemctl enable darklens.service
        sudo systemctl restart darklens.service
        echo -e "\e[32m[DarkLens]\e[0m Systemd service 'darklens' installed and started!"
        ;;
    Darwin*)    
        echo -e "\e[34m[DarkLens]\e[0m macOS detected. Creating Launchd daemon..."
        PLIST_FILE="$HOME/Library/LaunchAgents/com.darklens.daemon.plist"
        
        NODE_PATH=$(which node)
        if [ -z "$NODE_PATH" ]; then
            NODE_PATH="/usr/local/bin/node"
        fi
        NODE_DIR=$(dirname "$NODE_PATH")

        cat > "$PLIST_FILE" <<EOL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.darklens.daemon</string>
    <key>ProgramArguments</key>
    <array>
        <string>$CURRENT_DIR/start.sh</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>$NODE_DIR:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH</string>
    </dict>
    <key>WorkingDirectory</key>
    <string>$CURRENT_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOL
        launchctl unload "$PLIST_FILE" 2>/dev/null || true
        launchctl load "$PLIST_FILE"
        echo -e "\e[32m[DarkLens]\e[0m Launchd daemon 'com.darklens.daemon' installed and started!"
        ;;
    *)          
        echo -e "\e[31m[DarkLens]\e[0m OS not supported for automatic daemon installation."
        exit 1
        ;;
esac

echo -e "\e[32m[DarkLens]\e[0m Installation complete! DarkLens will now run automatically in the background."
echo -e "\e[32m[DarkLens]\e[0m You can access the Command Center at: http://darklens.local:5173"
