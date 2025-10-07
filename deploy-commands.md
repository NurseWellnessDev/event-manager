# Deployment Commands

## GitHub Setup

After creating the repository on GitHub, run these commands:

```bash
# Add GitHub as remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/event-manager.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Vercel Deployment

### Option 1: Vercel Dashboard (Recommended)
1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `event-manager` repository
5. Configure these environment variables:
   - `NEXT_PUBLIC_API_ENDPOINT` = `https://xsg0riey7e.execute-api.us-east-1.amazonaws.com/prod/eventcalendar`
6. Click "Deploy"

### Option 2: Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_ENDPOINT production
# Enter: https://xsg0riey7e.execute-api.us-east-1.amazonaws.com/prod/eventcalendar

# Deploy to production
vercel --prod
```

## Environment Variables for Vercel

Add these in the Vercel dashboard under Settings > Environment Variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_ENDPOINT` | `https://xsg0riey7e.execute-api.us-east-1.amazonaws.com/prod/eventcalendar` |

## Post-Deployment

After successful deployment, your app will be available at:
- `https://your-project-name.vercel.app`

## Automatic Deployments

Once connected to GitHub, Vercel will automatically deploy:
- **Production**: When you push to `main` branch
- **Preview**: When you create pull requests

## Custom Domain (Optional)

To add a custom domain:
1. Go to Vercel Dashboard > Settings > Domains
2. Add your domain
3. Configure DNS records as instructed