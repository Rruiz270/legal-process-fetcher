# 🚀 Legal Process Fetcher - Deployment Guide

## Quick Deployment to Vercel

### 1. **Push to GitHub**
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Legal Process Fetcher v1.0"

# Push to your GitHub repository
git remote add origin https://github.com/rruiz270/legal-process-fetcher.git
git branch -M main
git push -u origin main
```

### 2. **Deploy to Vercel**

**Option A: Via Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts:
# ? Set up and deploy "~/legal-process-fetcher"? [Y/n] Y
# ? Which scope do you want to deploy to? Your Account
# ? Link to existing project? [y/N] N
# ? What's your project's name? legal-process-fetcher
# ? In which directory is your code located? ./
```

**Option B: Via Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `rruiz270/legal-process-fetcher`
4. Configure project settings (auto-detected)
5. Click "Deploy"

### 3. **Production URLs**
- **Frontend**: `https://legal-process-fetcher.vercel.app`
- **API**: `https://legal-process-fetcher.vercel.app/api`

## Environment Configuration

### Production Environment Variables
```bash
NODE_ENV=production

# Optional: Custom rate limits
API_RATE_LIMIT_BASIC=100
API_RATE_LIMIT_ENHANCED=500
API_RATE_LIMIT_COMPREHENSIVE=1000

# Optional: Custom timeout
API_TIMEOUT=60000
```

## Features Available After Deployment

### 🔓 Basic Search (Public)
- **URL**: `https://your-app.vercel.app`
- **Coverage**: 60-70% of all processes
- **Authentication**: None required
- **Rate Limit**: 100 requests per 15 minutes

### 🔐 Enhanced Search (OAB Required)
- **URL**: `https://your-app.vercel.app` (select Enhanced Search)
- **Coverage**: 85-90% of all processes
- **Authentication**: Valid OAB credentials required
- **Features**: Confidential processes, sealed documents, enhanced data
- **Rate Limit**: 500 requests per 15 minutes

### 🏛️ Comprehensive Search (Certificate Required)
- **URL**: `https://your-app.vercel.app` (select Comprehensive Search)
- **Coverage**: 95-99% of all processes
- **Authentication**: Legal digital certificate required
- **Features**: Complete sensitive data access, financial information, full documents
- **Rate Limit**: 1000 requests per 15 minutes

## API Endpoints

All endpoints are available at: `https://your-app.vercel.app/api`

### Basic Search
```bash
POST /api/search/all
POST /api/search/court-type
```

### Enhanced Search (OAB)
```bash
POST /api/search/enhanced-oab
Content-Type: application/json

{
  "cnpj": "08.049.394/0001-84",
  "oabNumber": "123456",
  "oabState": "SP", 
  "oabPassword": "your-password"
}
```

### Comprehensive Search (Certificate)
```bash
POST /api/search/comprehensive-certificate
Content-Type: application/json

{
  "cnpj": "08.049.394/0001-84"
}
```

### Utility Endpoints
```bash
GET /api/capabilities           # Get search capabilities
POST /api/validate-cnpj        # CNPJ validation
POST /api/export              # Export results
GET /api/health               # Health check
```

## Testing the Deployment

### 1. **Basic Functionality Test**
```bash
# Health check
curl https://your-app.vercel.app/api/health

# CNPJ validation
curl -X POST https://your-app.vercel.app/api/validate-cnpj \
  -H "Content-Type: application/json" \
  -d '{"cnpj": "08.049.394/0001-84"}'

# Basic search
curl -X POST https://your-app.vercel.app/api/search/all \
  -H "Content-Type: application/json" \
  -d '{"cnpj": "08.049.394/0001-84"}'
```

### 2. **Frontend Test**
- Visit: `https://your-app.vercel.app`
- Enter CNPJ: `08.049.394/0001-84`
- Select "Basic Search"
- Click "Search Processes"
- Verify results display

### 3. **Enhanced Search Test** (if you have OAB credentials)
- Select "Enhanced Search - OAB Required"
- Enter your OAB credentials
- Search should return enhanced results

## Monitoring & Maintenance

### Performance Monitoring
- **Response Times**: Monitor via Vercel dashboard
- **Error Rates**: Check Vercel function logs
- **Usage**: Track API usage patterns

### Rate Limiting
- **Basic**: 100 requests/15min per IP
- **Enhanced**: 500 requests/15min per IP  
- **Certificate**: 1000 requests/15min per IP

### Log Monitoring
```bash
# View recent logs
vercel logs legal-process-fetcher

# Stream logs in real-time
vercel logs legal-process-fetcher --follow
```

## Security Considerations

### Production Security
- ✅ HTTPS enforced
- ✅ CORS configured for production domains
- ✅ Rate limiting active
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Error sanitization

### OAB Security
- 🔐 Credentials transmitted over HTTPS only
- 🔐 No credential storage on client
- 🔐 Server-side authentication validation
- 🔐 Session management

### Certificate Security
- 🏛️ Certificate files stored securely
- 🏛️ Private key protection
- 🏛️ Certificate validation
- 🏛️ Audit trail logging

## Scaling Considerations

### Vercel Limits
- **Function Duration**: 60 seconds max
- **Memory**: 1024 MB per function
- **Concurrent Executions**: 1000 per deployment

### Performance Optimization
- Response caching for repeated searches
- Request batching for multiple courts
- Optimized API calls with timeouts
- Efficient data aggregation

## Support & Maintenance

### Regular Updates
```bash
# Update dependencies
npm update
cd client && npm update && cd ..

# Test updates
npm test
npm run build

# Deploy updates  
vercel --prod
```

### Backup Strategy
- Source code: GitHub repository
- Configuration: Environment variables backed up
- Logs: Vercel retains logs for 30 days

### Troubleshooting

**Common Issues:**

1. **API Timeout Errors**
   - Check CNJ API status
   - Verify network connectivity
   - Increase timeout in environment variables

2. **CNPJ Validation Fails**
   - Verify CNPJ format: XX.XXX.XXX/XXXX-XX
   - Check for valid check digits

3. **OAB Authentication Fails**
   - Verify OAB credentials
   - Check OAB state selection
   - Ensure account is active

4. **Rate Limit Exceeded**
   - Wait for rate limit reset (15 minutes)
   - Consider upgrading to enhanced search
   - Implement request queuing

### Contact Support
- **GitHub Issues**: https://github.com/rruiz270/legal-process-fetcher/issues
- **Email**: For enterprise support and certificate setup

---

## 🎉 Deployment Complete!

Your Legal Process Fetcher is now live and ready to search Brazilian legal processes!

**Live App**: `https://your-app.vercel.app`

### Next Steps:
1. ✅ Test all search levels
2. ✅ Configure OAB authentication (if available)
3. ✅ Set up certificate authentication (contact support)
4. ✅ Monitor performance and usage
5. ✅ Scale as needed

**Happy searching! 🇧🇷⚖️**