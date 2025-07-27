import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as docdb from 'aws-cdk-lib/aws-docdb';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export class RetailForecastStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'RetailForecastVPC', {
      maxAzs: 2,
      natGateways: 1
    });

    // Security Groups
    const appSecurityGroup = new ec2.SecurityGroup(this, 'AppSecurityGroup', {
      vpc,
      description: 'Security group for retail forecast app',
      allowAllOutbound: true
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
      vpc,
      description: 'Security group for database',
      allowAllOutbound: false
    });

    dbSecurityGroup.addIngressRule(
      appSecurityGroup,
      ec2.Port.tcp(27017),
      'Allow app to connect to MongoDB'
    );

    // DocumentDB (MongoDB compatible)
    const dbCluster = new docdb.DatabaseCluster(this, 'RetailForecastDB', {
      masterUser: {
        username: 'admin'
      },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
      },
      vpc,
      securityGroup: dbSecurityGroup,
      engineVersion: '4.0.0',
      instances: 1
    });

    // ElastiCache Redis
    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      description: 'Subnet group for Redis',
      subnetIds: vpc.privateSubnets.map(subnet => subnet.subnetId)
    });

    const redisCluster = new elasticache.CfnCacheCluster(this, 'RedisCluster', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      numCacheNodes: 1,
      cacheSubnetGroupName: redisSubnetGroup.ref,
      vpcSecurityGroupIds: [dbSecurityGroup.securityGroupId]
    });

    // S3 Bucket for data storage
    const dataBucket = new s3.Bucket(this, 'RetailForecastDataBucket', {
      bucketName: `retail-forecast-data-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'RetailForecastCluster', {
      vpc,
      containerInsights: true
    });

    // Task Role
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
      ]
    });

    dataBucket.grantReadWrite(taskRole);

    // Secrets
    const appSecrets = new secretsmanager.Secret(this, 'AppSecrets', {
      description: 'Application secrets for retail forecast app',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          JWT_SECRET: '',
          SHOPIFY_CLIENT_SECRET: '',
          AMAZON_SECRET_KEY: ''
        }),
        generateStringKey: 'JWT_SECRET',
        excludeCharacters: '"@/\\'
      }
    });

    // Application Load Balanced Fargate Service
    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'RetailForecastService', {
      cluster,
      cpu: 1024,
      memoryLimitMiB: 2048,
      desiredCount: 2,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../'),
        containerPort: 3000,
        taskRole,
        environment: {
          NODE_ENV: 'production',
          AWS_REGION: this.region,
          S3_BUCKET: dataBucket.bucketName,
          REDIS_HOST: redisCluster.attrRedisEndpointAddress,
          MONGODB_URI: `mongodb://${dbCluster.clusterEndpoint.hostname}:${dbCluster.clusterEndpoint.port}/retailforecast`
        },
        secrets: {
          JWT_SECRET: ecs.Secret.fromSecretsManager(appSecrets, 'JWT_SECRET'),
          SHOPIFY_CLIENT_SECRET: ecs.Secret.fromSecretsManager(appSecrets, 'SHOPIFY_CLIENT_SECRET'),
          AMAZON_SECRET_KEY: ecs.Secret.fromSecretsManager(appSecrets, 'AMAZON_SECRET_KEY')
        }
      },
      publicLoadBalancer: true,
      assignPublicIp: false,
      platformVersion: ecs.FargatePlatformVersion.LATEST
    });

    fargateService.service.connections.allowTo(dbCluster, ec2.Port.tcp(27017));
    dbSecurityGroup.addIngressRule(
      fargateService.service.connections.securityGroups[0],
      ec2.Port.tcp(6379),
      'Allow app to connect to Redis'
    );

    // Auto Scaling
    const scaling = fargateService.service.autoScaleTaskCount({
      minCapacity: 2,
      maxCapacity: 10
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.minutes(5),
      scaleOutCooldown: cdk.Duration.minutes(2)
    });

    scaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 80
    });

    // CloudWatch Alarms and Monitoring
    const cpuAlarm = fargateService.service.metricCpuUtilization().createAlarm(this, 'HighCpuAlarm', {
      threshold: 80,
      evaluationPeriods: 2
    });

    const memoryAlarm = fargateService.service.metricMemoryUtilization().createAlarm(this, 'HighMemoryAlarm', {
      threshold: 85,
      evaluationPeriods: 2
    });

    // Outputs
    new cdk.CfnOutput(this, 'LoadBalancerURL', {
      value: fargateService.loadBalancer.loadBalancerDnsName,
      description: 'URL of the load balancer'
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: dbCluster.clusterEndpoint.socketAddress,
      description: 'Database cluster endpoint'
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: dataBucket.bucketName,
      description: 'S3 bucket for data storage'
    });
  }
}