# OrderNimbus WordPress - AWS Deployment Guide

This guide provides instructions for deploying the OrderNimbus WordPress application to AWS using containerized infrastructure.

## Architecture Overview

The deployment uses the following AWS services:
- **ECS Fargate**: Container orchestration for WordPress application
- **RDS MySQL**: Managed database service
- **Application Load Balancer**: Load balancing and SSL termination
- **ECR**: Container registry for Docker images
- **VPC**: Isolated network environment with public/private subnets
- **Secrets Manager**: Secure storage for sensitive configuration
- **CloudWatch**: Logging and monitoring

## Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Docker** installed and running
3. **Domain name** with DNS management access
4. **SSL Certificate** in AWS Certificate Manager

### Required AWS Permissions

Your AWS user/role needs the following permissions:
- CloudFormation (full access)
- ECS (full access)
- ECR (full access)
- RDS (full access)
- EC2/VPC (full access)
- IAM (role creation)
- Secrets Manager (full access)
- Application Load Balancer (full access)

## Quick Start

### 1. SSL Certificate Setup

Before deployment, you need an SSL certificate in AWS Certificate Manager:

```bash
# Request certificate (replace with your domain)
aws acm request-certificate \
    --domain-name ordernimbus.com \
    --subject-alternative-names "*.ordernimbus.com" \
    --validation-method DNS \
    --region us-east-1
```

Note the Certificate ARN from the output.

### 2. Environment Configuration

Copy and configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your specific values:

```bash
# Database Configuration
DB_NAME=ordernimbus_wp
DB_USER=wp_user
DB_PASSWORD=your_secure_database_password_here
DB_HOST=localhost

# WordPress Configuration
WORDPRESS_URL=https://ordernimbus.com
WORDPRESS_TITLE=OrderNimbus - Enterprise AI-Powered Sales Forecasting
WORDPRESS_ADMIN_USER=admin
WORDPRESS_ADMIN_PASSWORD=your_secure_admin_password_here
WORDPRESS_ADMIN_EMAIL=admin@ordernimbus.com

# Generate WordPress security keys from: https://api.wordpress.org/secret-key/1.1/salt/
WP_AUTH_KEY=generate_unique_key_here
WP_SECURE_AUTH_KEY=generate_unique_key_here
WP_LOGGED_IN_KEY=generate_unique_key_here
WP_NONCE_KEY=generate_unique_key_here
WP_AUTH_SALT=generate_unique_salt_here
WP_SECURE_AUTH_SALT=generate_unique_salt_here
WP_LOGGED_IN_SALT=generate_unique_salt_here
WP_NONCE_SALT=generate_unique_salt_here

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
ENVIRONMENT=production
DOMAIN_NAME=ordernimbus.com
CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/certificate-id
```

### 3. Deploy to AWS

Run the deployment script:

```bash
./scripts/deploy.sh
```

This will:
1. Build and push the Docker image to ECR
2. Deploy the CloudFormation infrastructure
3. Update the ECS service
4. Display deployment information

### 4. DNS Configuration

After deployment, update your domain's DNS to point to the Application Load Balancer:

1. Get the ALB DNS name from the deployment output
2. Create a CNAME record: `ordernimbus.com` → `your-alb-dns-name`

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Build and Push Docker Image

```bash
# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t production-ordernimbus .

# Tag and push
docker tag production-ordernimbus:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/production-ordernimbus:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/production-ordernimbus:latest
```

### 2. Deploy Infrastructure

```bash
aws cloudformation create-stack \
    --stack-name production-ordernimbus-infrastructure \
    --template-body file://aws/cloudformation-template.yaml \
    --parameters ParameterKey=Environment,ParameterValue=production \
                ParameterKey=DomainName,ParameterValue=ordernimbus.com \
                ParameterKey=CertificateArn,ParameterValue=your-certificate-arn \
                ParameterKey=DBPassword,ParameterValue=your-db-password \
                ParameterKey=WordPressAdminPassword,ParameterValue=your-admin-password \
    --capabilities CAPABILITY_IAM \
    --region us-east-1
```

### 3. Wait for Completion

```bash
aws cloudformation wait stack-create-complete \
    --stack-name production-ordernimbus-infrastructure \
    --region us-east-1
```

## Local Testing

Test the containerized application locally:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Access application
open http://localhost:8080
```

Stop local services:
```bash
docker-compose down -v
```

## Deployment Management

### Check Status

```bash
./scripts/deploy.sh status
```

### Update Application

To deploy code changes:

```bash
./scripts/deploy.sh build    # Build and push new image
./scripts/deploy.sh update   # Update ECS service
```

### Update Infrastructure

To update AWS resources:

```bash
./scripts/deploy.sh infra
```

### View Logs

```bash
# ECS service logs
aws logs tail /ecs/production-ordernimbus --follow --region us-east-1

# Database logs
aws rds describe-db-log-files --db-instance-identifier production-ordernimbus-db --region us-east-1
```

## Monitoring and Maintenance

### CloudWatch Metrics

Monitor key metrics:
- ECS Service CPU/Memory utilization
- ALB request count and latency
- RDS connections and performance

### Database Backups

RDS automated backups are configured with 7-day retention. For manual backups:

```bash
aws rds create-db-snapshot \
    --db-instance-identifier production-ordernimbus-db \
    --db-snapshot-identifier ordernimbus-manual-backup-$(date +%Y%m%d) \
    --region us-east-1
```

### Scaling

#### Horizontal Scaling (ECS Tasks)

```bash
aws ecs update-service \
    --cluster production-ordernimbus-cluster \
    --service production-ordernimbus-service \
    --desired-count 4 \
    --region us-east-1
```

#### Vertical Scaling (Database)

Update the CloudFormation template with a larger `DBInstanceClass` and redeploy.

## Security Considerations

1. **Secrets Management**: All sensitive data is stored in AWS Secrets Manager
2. **Network Security**: Private subnets for database and application containers
3. **SSL/TLS**: Enforced HTTPS with certificate validation
4. **Security Groups**: Least-privilege access rules
5. **Image Scanning**: ECR vulnerability scanning enabled

## Troubleshooting

### Common Issues

#### 1. ECS Tasks Failing to Start

Check ECS service events:
```bash
aws ecs describe-services \
    --cluster production-ordernimbus-cluster \
    --services production-ordernimbus-service \
    --region us-east-1
```

#### 2. Database Connection Issues

Verify RDS security groups and subnet configuration.

#### 3. SSL Certificate Issues

Ensure certificate is validated and covers your domain.

### Support Commands

```bash
# Get stack outputs
aws cloudformation describe-stacks \
    --stack-name production-ordernimbus-infrastructure \
    --query 'Stacks[0].Outputs' \
    --region us-east-1

# Check ECS task logs
aws logs tail /ecs/production-ordernimbus --follow --region us-east-1

# List ECR images
aws ecr describe-images \
    --repository-name production-ordernimbus \
    --region us-east-1
```

## Cost Optimization

- Use FARGATE_SPOT for non-critical environments
- Schedule ECS tasks to scale down during low-traffic periods
- Use RDS reserved instances for production
- Enable CloudWatch cost monitoring

## Cleanup

To remove all AWS resources:

```bash
# Delete CloudFormation stack
aws cloudformation delete-stack \
    --stack-name production-ordernimbus-infrastructure \
    --region us-east-1

# Wait for deletion
aws cloudformation wait stack-delete-complete \
    --stack-name production-ordernimbus-infrastructure \
    --region us-east-1

# Manually delete ECR images if needed
aws ecr batch-delete-image \
    --repository-name production-ordernimbus \
    --image-ids imageTag=latest \
    --region us-east-1
```