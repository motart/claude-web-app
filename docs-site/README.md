# OrderNimbus Documentation Site

This is the official documentation site for OrderNimbus, built with Next.js and Material-UI.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3002
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
docs-site/
├── pages/           # Next.js pages
│   ├── api/         # API documentation
│   ├── getting-started/ # Getting started guides
│   ├── integrations/    # Platform integrations
│   ├── support/         # Support and FAQ
│   └── ...
├── components/      # Reusable React components
├── styles/          # Global styles
├── public/          # Static assets
└── content/         # Markdown content (future)
```

## 📖 Documentation Sections

- **Getting Started**: Quick start guides and tutorials
- **API Reference**: Complete REST API documentation
- **Integrations**: Platform-specific integration guides
- **Guides**: Best practices and advanced topics
- **Security**: Security and compliance information
- **Support**: FAQ and contact information

## 🛠️ Technology Stack

- **Framework**: Next.js 14
- **UI Library**: Material-UI (MUI) v5
- **Styling**: Emotion (CSS-in-JS)
- **Language**: TypeScript
- **Deployment**: Docker + Nginx

## 🌐 Deployment

The documentation site is automatically deployed to:
- **Production**: https://docs.ordernimbus.com
- **Staging**: https://docs-staging.ordernimbus.com

### Environment Variables

```bash
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.ordernimbus.com
```

## 📝 Content Management

### Adding New Pages

1. Create a new `.tsx` file in the appropriate `pages/` directory
2. Update the navigation in `components/Layout.tsx`
3. Follow the existing component structure and styling patterns

### Content Guidelines

- Use clear, concise language
- Include code examples for technical topics
- Add proper TypeScript types
- Follow accessibility best practices
- Include SEO meta tags

## 🔧 Development Guidelines

### Code Style

- Use TypeScript for all components
- Follow Material-UI design patterns
- Implement responsive design
- Add proper error handling

### Component Structure

```tsx
import React from 'react'
import { Container, Typography, Box } from '@mui/material'

const PageName = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
        Page Title
      </Typography>
      {/* Page content */}
    </Container>
  )
}

export default PageName
```

## 🚀 Performance

- Static site generation for optimal performance
- Image optimization with Next.js
- Gzip compression via Nginx
- CDN integration ready
- Proper caching headers

## 📊 Analytics

The site includes:
- Google Analytics integration (production only)
- Performance monitoring
- Error tracking
- User behavior analytics

## 🔒 Security

- Security headers via Nginx
- HTTPS enforcement
- Content Security Policy
- XSS protection
- CSRF protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions about the documentation site:
- **Technical Issues**: dev@ordernimbus.com  
- **Content Updates**: docs@ordernimbus.com
- **General Support**: support@ordernimbus.com

## 📄 License

© 2024 OrderNimbus Inc. All rights reserved.