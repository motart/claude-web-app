#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RetailForecastStack } from '../lib/retail-forecast-stack';

const app = new cdk.App();

new RetailForecastStack(app, 'RetailForecastStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  },
  description: 'AI-powered sales forecasting platform for retail stores'
});