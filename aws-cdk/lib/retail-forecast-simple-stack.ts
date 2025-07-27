import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';

export class RetailForecastSimpleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'RetailForecastVPC', {
      maxAzs: 2
    });

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, 'RetailForecastCluster', {
      vpc
    });

    // Create a Fargate service with an ALB (cost-optimized settings)
    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'RetailForecastService', {
      cluster,
      cpu: 256,        // Minimum CPU for cost savings
      memoryLimitMiB: 512,  // Minimum memory for cost savings
      desiredCount: 1,      // Single instance for testing
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../'),
        containerPort: 3000,
        environment: {
          NODE_ENV: 'production',
          JWT_SECRET: 'test-jwt-secret-change-in-production-' + Math.random().toString(36),
          MONGODB_URI: 'mongodb://localhost:27017/retailforecast',
          REDIS_URL: 'redis://localhost:6379'
        }
      },
      publicLoadBalancer: true
    });

    // Output the URL
    new cdk.CfnOutput(this, 'LoadBalancerURL', {
      value: fargateService.loadBalancer.loadBalancerDnsName,
      description: 'URL of the Application Load Balancer'
    });
  }
}