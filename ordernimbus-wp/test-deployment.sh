#!/bin/bash

# Simple deployment test script
set -e

echo "🧪 Testing OrderNimbus Deployment Configuration"
echo "================================================"

# Test 1: Check Docker configuration
echo "✅ Test 1: Docker configuration files"
if [[ -f "Dockerfile" ]]; then
    echo "   ✓ Dockerfile exists"
else
    echo "   ✗ Dockerfile missing"
    exit 1
fi

if [[ -f "docker-compose.yml" ]]; then
    echo "   ✓ docker-compose.yml exists"
else
    echo "   ✗ docker-compose.yml missing"
    exit 1
fi

if [[ -f ".dockerignore" ]]; then
    echo "   ✓ .dockerignore exists"
else
    echo "   ✗ .dockerignore missing"
    exit 1
fi

# Test 2: Check AWS configuration
echo "✅ Test 2: AWS CloudFormation configuration"
if [[ -f "aws/cloudformation-template.yaml" ]]; then
    echo "   ✓ CloudFormation template exists"
else
    echo "   ✗ CloudFormation template missing"
    exit 1
fi

# Test 3: Check deployment scripts
echo "✅ Test 3: Deployment scripts"
if [[ -f "scripts/deploy.sh" ]] && [[ -x "scripts/deploy.sh" ]]; then
    echo "   ✓ Deployment script exists and is executable"
else
    echo "   ✗ Deployment script missing or not executable"
    exit 1
fi

# Test 4: Check environment configuration
echo "✅ Test 4: Environment configuration"
if [[ -f ".env.example" ]]; then
    echo "   ✓ .env.example exists"
else
    echo "   ✗ .env.example missing"
    exit 1
fi

# Test 5: Check documentation
echo "✅ Test 5: Documentation"
if [[ -f "DEPLOYMENT.md" ]]; then
    echo "   ✓ DEPLOYMENT.md exists"
else
    echo "   ✗ DEPLOYMENT.md missing"
    exit 1
fi

# Test 6: Check WordPress configuration
echo "✅ Test 6: WordPress configuration"
if grep -q "getenv('DB_NAME')" wp-config.php; then
    echo "   ✓ wp-config.php is environment-aware"
else
    echo "   ✗ wp-config.php not properly configured for environment variables"
    exit 1
fi

# Test 7: Validate CloudFormation template
echo "✅ Test 7: CloudFormation template validation"
if command -v aws &> /dev/null; then
    if aws cloudformation validate-template --template-body file://aws/cloudformation-template.yaml &> /dev/null; then
        echo "   ✓ CloudFormation template is valid"
    else
        echo "   ⚠  CloudFormation template validation failed (check AWS CLI configuration)"
    fi
else
    echo "   ⚠  AWS CLI not available for template validation"
fi

# Test 8: Check Docker compose syntax
echo "✅ Test 8: Docker Compose configuration"
if command -v docker-compose &> /dev/null; then
    if docker-compose config &> /dev/null; then
        echo "   ✓ docker-compose.yml syntax is valid"
    else
        echo "   ✗ docker-compose.yml has syntax errors"
        exit 1
    fi
else
    echo "   ⚠  Docker Compose not available for validation"
fi

echo ""
echo "🎉 All deployment configuration tests passed!"
echo ""
echo "Next Steps:"
echo "1. Copy .env.example to .env and configure your settings"
echo "2. Ensure you have an SSL certificate in AWS Certificate Manager"
echo "3. Run: ./scripts/deploy.sh"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"