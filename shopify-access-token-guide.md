# Shopify Access Token Issues - Diagnostic Guide

## Issue Found
Your store `ydih31-nw.myshopify.com` is accessible, but the access token `[REDACTED]` is being rejected by Shopify's API.

**Error**: `[API] Invalid API key or access token (unrecognized login or wrong password)`

## Possible Causes
1. **Token has expired** - Private app tokens can expire
2. **Token is incorrect** - There might be a typo in the token
3. **Insufficient permissions** - The token doesn't have the required API access rights
4. **App has been deleted/disabled** - The private app that generated this token might have been removed

## How to Fix This

### Step 1: Check Your Private App
1. Log into your Shopify admin at `https://ydih31-nw.myshopify.com/admin`
2. Go to **Settings** → **Apps and sales channels**
3. Look for **Private apps** or **Custom apps** section
4. Find the app that generated your access token

### Step 2: Verify Token Permissions
Your app needs these permissions for our integration:
- ✅ **Orders**: Read access
- ✅ **Products**: Read access  
- ✅ **Customers**: Read access (optional but recommended)
- ✅ **Analytics**: Read access (optional for enhanced insights)

### Step 3: Generate a New Access Token

#### Option A: If you still have the private app:
1. Open your private app settings
2. Look for the **API credentials** section
3. Copy the **Admin API access token** (starts with `shpat_`)
4. Verify it has the permissions listed above

#### Option B: Create a new private app:
1. In Shopify admin, go to **Settings** → **Apps and sales channels**
2. Click **Develop apps for your store**
3. Click **Allow custom app development** (if needed)
4. Click **Create an app**
5. Name it something like "Sales Data Sync" or "OrderNimbus Integration"
6. Go to **Configuration** tab
7. Under **Admin API access scopes**, select:
   - `read_orders`
   - `read_products`
   - `read_customers` (optional)
   - `read_analytics` (optional)
8. Click **Save**
9. Go to **API credentials** tab
10. Click **Install app**
11. Copy the new **Admin API access token**

### Step 4: Test the New Token
Once you have a valid token, we can test it again with our integration.

## Alternative: Use Shopify Partners OAuth (For Production Apps)
If you plan to use this for multiple stores or want a more robust solution, we can set up OAuth flow through Shopify Partners:

1. Create a Shopify Partner account
2. Create a public app
3. Use OAuth 2.0 flow for authentication

## What We've Verified
✅ Your store domain `ydih31-nw.myshopify.com` is valid and accessible  
✅ Our integration code can communicate with Shopify APIs  
✅ The store ID is `89964675256`  
❌ The provided access token is invalid/expired  

## Next Steps
1. **Get a valid access token** using the steps above
2. **Test the connection** - I'll validate it works with our system
3. **Import your sales data** - Once connected, we can sync all your historical orders
4. **Set up automated sync** - Keep your data up to date automatically

Let me know once you have a new access token and I'll test the full integration!