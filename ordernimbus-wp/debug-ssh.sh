#!/bin/bash

# Debug SSH connection issues

REMOTE_HOST="52.41.161.0"
SSH_KEY_PATH="./ordernimbus-lightsail.pem"

echo "🔍 DEBUGGING SSH CONNECTION"
echo "=========================="

echo "1️⃣ Checking PEM file..."
if [ -f "$SSH_KEY_PATH" ]; then
    echo "✅ PEM file exists"
    echo "File permissions: $(ls -la $SSH_KEY_PATH)"
    echo "File size: $(wc -c < $SSH_KEY_PATH) bytes"
    
    # Check if it's a valid private key
    if head -1 "$SSH_KEY_PATH" | grep -q "BEGIN.*PRIVATE KEY"; then
        echo "✅ PEM file starts with BEGIN PRIVATE KEY"
    else
        echo "❌ PEM file doesn't start with BEGIN PRIVATE KEY"
        echo "First line: $(head -1 $SSH_KEY_PATH)"
    fi
    
    if tail -1 "$SSH_KEY_PATH" | grep -q "END.*PRIVATE KEY"; then
        echo "✅ PEM file ends with END PRIVATE KEY"
    else
        echo "❌ PEM file doesn't end with END PRIVATE KEY"
        echo "Last line: $(tail -1 $SSH_KEY_PATH)"
    fi
else
    echo "❌ PEM file not found at $SSH_KEY_PATH"
    exit 1
fi

echo ""
echo "2️⃣ Testing basic network connectivity..."
if ping -c 1 "$REMOTE_HOST" &>/dev/null; then
    echo "✅ Server is reachable via ping"
else
    echo "❌ Server is not reachable via ping"
fi

# Test SSH port
if nc -z "$REMOTE_HOST" 22 2>/dev/null; then
    echo "✅ SSH port 22 is open"
else
    echo "❌ SSH port 22 is not accessible"
fi

echo ""
echo "3️⃣ Testing SSH connection with verbose output..."
echo "Trying different usernames with detailed SSH debug..."

USERNAMES=("bitnami" "ubuntu" "ec2-user" "admin" "centos" "debian" "root")

for user in "${USERNAMES[@]}"; do
    echo ""
    echo "--- Testing $user@$REMOTE_HOST ---"
    
    # Try with verbose SSH to see what's happening
    timeout 15 ssh -vvv -o ConnectTimeout=10 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$SSH_KEY_PATH" "$user@$REMOTE_HOST" "echo 'SUCCESS: Connected as $user'" 2>&1 | grep -E "(debug1:|Permission denied|Authentication|Offering|Server accepts|Connection established|SUCCESS:)" | head -20
done

echo ""
echo "4️⃣ Checking AWS Lightsail specific info..."
echo "💡 Common Lightsail troubleshooting:"
echo "   - Default username is usually 'bitnami' for WordPress instances"
echo "   - Make sure this PEM key was used when creating the instance"
echo "   - Check if the instance is in 'running' state"
echo "   - Verify the SSH port (22) is allowed in Lightsail firewall"

echo ""
echo "5️⃣ Alternative: Try connecting via AWS Lightsail console..."
echo "   1. Go to AWS Lightsail console"
echo "   2. Find your instance"
echo "   3. Click 'Connect using SSH' button"
echo "   4. This will show you the exact username and connection method"

echo ""
echo "🔧 Quick fixes to try:"
echo "   1. Recreate PEM file (copy/paste from AWS console)"
echo "   2. Check instance is running in Lightsail console"
echo "   3. Try connecting via Lightsail web console first"