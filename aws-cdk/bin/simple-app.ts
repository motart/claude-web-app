#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RetailForecastSimpleStack } from '../lib/retail-forecast-simple-stack';

const app = new cdk.App();
new RetailForecastSimpleStack(app, 'RetailForecastSimpleStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});