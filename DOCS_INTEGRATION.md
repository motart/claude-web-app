# Documentation Integration Guide

## Overview
The OrderNimbus application now includes seamless integration with the documentation site, providing users with instant access to help and API references.

## Cross-Linking Setup

### From Main App to Documentation
- **Location**: Sidebar → Help & Docs (bottom section)
- **Icon**: Help icon with "open in new tab" indicator
- **Behavior**: Opens documentation site in new tab
- **URLs**:
  - Development: `http://localhost:3002`
  - Production: `https://docs.ordernimbus.com`

### From Documentation to Main App
- **Location**: Documentation header → Dashboard button
- **Behavior**: Opens main application in new tab
- **URLs**:
  - Development: `http://localhost:3001`
  - Production: `https://app.ordernimbus.com`

## Environment Configuration

### Main Application (.env.local)
```bash
REACT_APP_DOCS_URL=http://localhost:3002  # Development
# REACT_APP_DOCS_URL=https://docs.ordernimbus.com  # Production
```

### Documentation Site
No additional environment variables needed - uses NODE_ENV to determine URLs.

## User Experience Features

### Visual Indicators
- **External link icon**: Shows users the link opens in new tab
- **Descriptive text**: "View API documentation" subtitle
- **Hover effects**: Visual feedback on interaction

### Fallback Handling
- **Popup blocking**: Alerts user with direct URL if popup is blocked
- **Server unavailable**: Provides manual URL for user navigation
- **Error recovery**: Graceful degradation if services are down

## Testing the Integration

### Development Testing
1. Start main application: `npm start` (port 3001)
2. Start documentation: `npm run dev` (port 3002)
3. Navigate to main app sidebar → Help & Docs
4. Verify documentation opens in new tab
5. In documentation, click Dashboard button
6. Verify main app opens in new tab

### Production Verification
1. Ensure DNS points to correct servers
2. Test cross-linking between production URLs
3. Verify SSL certificates work for both domains
4. Check that all links resolve properly

## Deployment Notes

### Main Application
- Set `REACT_APP_DOCS_URL=https://docs.ordernimbus.com` in production
- Ensure proper CORS configuration for cross-origin requests

### Documentation Site
- Deploy to `docs.ordernimbus.com` subdomain
- Configure proper redirects and error pages
- Enable SSL/HTTPS for secure access

## Troubleshooting

### Common Issues
1. **"Docs not loading"**: Check if documentation server is running on port 3002
2. **"Popup blocked"**: User sees alert with manual URL - expected behavior
3. **"Wrong URL in production"**: Verify environment variables are set correctly
4. **"Cross-origin errors"**: Check CORS configuration and domain settings

### Quick Fixes
```bash
# Restart documentation server
pkill -f "next dev" && npm run dev

# Check if ports are available
lsof -i :3001  # Main app
lsof -i :3002  # Documentation

# Test connectivity
curl http://localhost:3001
curl http://localhost:3002
```

## Future Enhancements

### Potential Improvements
- **Search integration**: Allow searching docs from main app
- **Contextual help**: Show relevant docs based on current page
- **Embedded documentation**: Display docs in modal/sidebar
- **User tracking**: Analytics for documentation usage
- **Deep linking**: Direct links to specific documentation sections

### API Integration
- **Help suggestions**: AI-powered help based on user actions
- **Dynamic content**: Show personalized documentation
- **Progress tracking**: Track user onboarding through docs
- **Feedback collection**: Gather user feedback on documentation

## Maintenance

### Regular Updates
- Keep cross-links updated when domains change
- Test integration after major deployments
- Monitor user feedback about documentation access
- Update environment variables for new environments

### Monitoring
- Check documentation site uptime
- Monitor cross-link click rates
- Track user engagement with help system
- Alert on broken links or server issues