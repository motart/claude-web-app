#!/bin/bash

# Test SSH connection with different usernames

REMOTE_HOST="52.41.161.0"
SSH_KEY_PATH="./ordernimbus-lightsail.pem"

echo "🔍 Testing SSH Connection to Lightsail Instance"
echo "=============================================="

# Check if PEM file exists and has correct permissions
echo "1️⃣ Checking PEM file..."
if [ -f "$SSH_KEY_PATH" ]; then
    echo "✅ PEM file exists"
    ls -la "$SSH_KEY_PATH"
    
    # Check if it's a valid private key
    if grep -q "BEGIN.*PRIVATE KEY" "$SSH_KEY_PATH"; then
        echo "✅ PEM file contains private key"
    else
        echo "❌ PEM file doesn't look like a private key"
    fi
else
    echo "❌ PEM file not found at $SSH_KEY_PATH"
    exit 1
fi

echo ""
echo "2️⃣ Testing common Lightsail usernames..."

# Common Lightsail usernames to try
USERNAMES=("bitnami" "ubuntu" "ec2-user" "admin" "centos" "debian")

for user in "${USERNAMES[@]}"; do
    echo "Testing $user@$REMOTE_HOST..."
    
    # Test connection with timeout
    if timeout 10 ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" "$user@$REMOTE_HOST" "echo 'Success with user: $user'" 2>/dev/null; then
        echo "✅ SUCCESS! Working username: $user"
        WORKING_USER="$user"
        break
    else
        echo "❌ Failed with user: $user"
    fi
done

if [ -n "$WORKING_USER" ]; then
    echo ""
    echo "🎉 Found working connection!"
    echo "Username: $WORKING_USER"
    echo "Host: $REMOTE_HOST"
    
    echo ""
    echo "3️⃣ Testing basic commands..."
    ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" "$WORKING_USER@$REMOTE_HOST" "whoami && pwd && ls -la"
    
    echo ""
    echo "✅ Connection successful! Update your deployment scripts to use: $WORKING_USER"
else
    echo ""
    echo "❌ Could not establish SSH connection with any common username"
    echo ""
    echo "🔍 Troubleshooting steps:"
    echo "1. Verify this is the correct IP: $REMOTE_HOST"
    echo "2. Check if the Lightsail instance is running"
    echo "3. Verify the SSH key pair name matches your instance"
    echo "4. Check Lightsail firewall allows SSH (port 22)"
    echo ""
    echo "💡 You can check the correct username in AWS Lightsail:"
    echo "   - Go to your instance details"
    echo "   - Look for 'Connect using SSH' instructions"
fi