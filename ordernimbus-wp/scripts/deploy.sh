#!/bin/bash

# OrderNimbus AWS Deployment Script
set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [[ ! -f "$ENV_FILE" ]]; then
    log_error ".env file not found. Please copy .env.example to .env and configure your settings."
    exit 1
fi

# Load environment variables
source "$ENV_FILE"

# Validate required environment variables
validate_env() {
    local required_vars=(
        "AWS_REGION"
        "AWS_ACCOUNT_ID"
        "ENVIRONMENT"
        "DOMAIN_NAME"
        "CERTIFICATE_ARN"
        "DB_PASSWORD"
        "WORDPRESS_ADMIN_PASSWORD"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
}

# Build and push Docker image to ECR
build_and_push_image() {
    log_info "Building and pushing Docker image to ECR..."
    
    # Get ECR login token
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Build the image
    docker build -t $ENVIRONMENT-ordernimbus $PROJECT_DIR
    
    # Tag the image
    docker tag $ENVIRONMENT-ordernimbus:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ENVIRONMENT-ordernimbus:latest
    
    # Push the image
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ENVIRONMENT-ordernimbus:latest
    
    log_success "Docker image pushed successfully"
}

# Deploy CloudFormation stack
deploy_infrastructure() {
    log_info "Deploying CloudFormation infrastructure..."
    
    local stack_name="$ENVIRONMENT-ordernimbus-infrastructure"
    local template_file="$PROJECT_DIR/aws/cloudformation-template.yaml"
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name $stack_name --region $AWS_REGION >/dev/null 2>&1; then
        log_info "Stack exists, updating..."
        aws cloudformation update-stack \
            --stack-name $stack_name \
            --template-body file://$template_file \
            --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
                        ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME \
                        ParameterKey=CertificateArn,ParameterValue=$CERTIFICATE_ARN \
                        ParameterKey=DBPassword,ParameterValue=$DB_PASSWORD \
                        ParameterKey=WordPressAdminPassword,ParameterValue=$WORDPRESS_ADMIN_PASSWORD \
            --capabilities CAPABILITY_IAM \
            --region $AWS_REGION
        
        log_info "Waiting for stack update to complete..."
        aws cloudformation wait stack-update-complete --stack-name $stack_name --region $AWS_REGION
    else
        log_info "Creating new stack..."
        aws cloudformation create-stack \
            --stack-name $stack_name \
            --template-body file://$template_file \
            --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
                        ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME \
                        ParameterKey=CertificateArn,ParameterValue=$CERTIFICATE_ARN \
                        ParameterKey=DBPassword,ParameterValue=$DB_PASSWORD \
                        ParameterKey=WordPressAdminPassword,ParameterValue=$WORDPRESS_ADMIN_PASSWORD \
            --capabilities CAPABILITY_IAM \
            --region $AWS_REGION
        
        log_info "Waiting for stack creation to complete..."
        aws cloudformation wait stack-create-complete --stack-name $stack_name --region $AWS_REGION
    fi
    
    log_success "Infrastructure deployed successfully"
}

# Update ECS service
update_ecs_service() {
    log_info "Updating ECS service..."
    
    local cluster_name="$ENVIRONMENT-ordernimbus-cluster"
    local service_name="$ENVIRONMENT-ordernimbus-service"
    
    # Force new deployment
    aws ecs update-service \
        --cluster $cluster_name \
        --service $service_name \
        --force-new-deployment \
        --region $AWS_REGION
    
    log_info "Waiting for service to stabilize..."
    aws ecs wait services-stable \
        --cluster $cluster_name \
        --services $service_name \
        --region $AWS_REGION
    
    log_success "ECS service updated successfully"
}

# Get stack outputs
get_stack_outputs() {
    log_info "Getting deployment information..."
    
    local stack_name="$ENVIRONMENT-ordernimbus-infrastructure"
    local outputs=$(aws cloudformation describe-stacks --stack-name $stack_name --region $AWS_REGION --query 'Stacks[0].Outputs' --output table)
    
    echo "$outputs"
    
    # Get ALB DNS name
    local alb_dns=$(aws cloudformation describe-stacks --stack-name $stack_name --region $AWS_REGION --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' --output text)
    
    log_success "Deployment completed successfully!"
    log_info "Application Load Balancer DNS: $alb_dns"
    log_info "Your application should be available at: https://$DOMAIN_NAME"
}

# Main deployment function
deploy() {
    log_info "Starting deployment of OrderNimbus WordPress application..."
    
    validate_env
    build_and_push_image
    deploy_infrastructure
    update_ecs_service
    get_stack_outputs
    
    log_success "Deployment completed successfully!"
}

# Help function
show_help() {
    echo "Usage: $0 [OPTION]"
    echo "Deploy OrderNimbus WordPress application to AWS"
    echo ""
    echo "Options:"
    echo "  deploy      Deploy the full application (default)"
    echo "  build       Build and push Docker image only"
    echo "  infra       Deploy infrastructure only"
    echo "  update      Update ECS service only"
    echo "  status      Show deployment status"
    echo "  help        Show this help message"
}

# Status function
show_status() {
    log_info "Checking deployment status..."
    
    local stack_name="$ENVIRONMENT-ordernimbus-infrastructure"
    
    # Check CloudFormation stack status
    local stack_status=$(aws cloudformation describe-stacks --stack-name $stack_name --region $AWS_REGION --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND")
    log_info "CloudFormation Stack Status: $stack_status"
    
    if [[ "$stack_status" != "NOT_FOUND" ]]; then
        # Check ECS service status
        local cluster_name="$ENVIRONMENT-ordernimbus-cluster"
        local service_name="$ENVIRONMENT-ordernimbus-service"
        
        local service_status=$(aws ecs describe-services --cluster $cluster_name --services $service_name --region $AWS_REGION --query 'services[0].status' --output text 2>/dev/null || echo "NOT_FOUND")
        log_info "ECS Service Status: $service_status"
        
        local running_count=$(aws ecs describe-services --cluster $cluster_name --services $service_name --region $AWS_REGION --query 'services[0].runningCount' --output text 2>/dev/null || echo "0")
        local desired_count=$(aws ecs describe-services --cluster $cluster_name --services $service_name --region $AWS_REGION --query 'services[0].desiredCount' --output text 2>/dev/null || echo "0")
        log_info "ECS Tasks: $running_count/$desired_count running"
    fi
}

# Main script logic
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    build)
        validate_env
        build_and_push_image
        ;;
    infra)
        validate_env
        deploy_infrastructure
        ;;
    update)
        validate_env
        update_ecs_service
        ;;
    status)
        validate_env
        show_status
        ;;
    help)
        show_help
        ;;
    *)
        log_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac