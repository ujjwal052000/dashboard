# Deployment Guide

This guide explains how to deploy the dashboard to production platforms and configure environment variables.

## Environment Variables Required

The dashboard requires the `GOOGLE_SERVICE_ACCOUNT` environment variable to be set in your hosting platform.

## Deployment Platforms

### Option 1: Vercel (Recommended for Next.js)

Vercel is the easiest way to deploy Next.js applications.

#### Steps:

1. **Push your code to GitHub** (already done ✅)

2. **Import your repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "Add New Project"
   - Import your repository: `ujjwal052000/dashboard`

3. **Configure Environment Variables:**
   - In the project settings, go to "Environment Variables"
   - Add a new variable:
     - **Name:** `GOOGLE_SERVICE_ACCOUNT`
     - **Value:** Your complete service account JSON (as a single line)
     - **Environment:** Production, Preview, Development (select all)
   - Click "Save"

4. **Deploy:**
   - Vercel will automatically deploy your project
   - Your dashboard will be available at `https://your-project.vercel.app`

#### Example Environment Variable Format:
```
GOOGLE_SERVICE_ACCOUNT={"type":"service_account","project_id":"dashboard-479519","private_key_id":"your-key-id","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n","client_email":"dashboard-sheet@dashboard-479519.iam.gserviceaccount.com","client_id":"your-client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/dashboard-sheet%40dashboard-479519.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```

### Option 2: Netlify

1. **Go to [netlify.com](https://netlify.com)**
2. **Sign up/Login with GitHub**
3. **Add new site from Git**
4. **Select your repository**
5. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
6. **Add Environment Variable:**
   - Go to Site settings → Environment variables
   - Add `GOOGLE_SERVICE_ACCOUNT` with your JSON value
7. **Deploy**

### Option 3: Railway

1. **Go to [railway.app](https://railway.app)**
2. **New Project → Deploy from GitHub**
3. **Select your repository**
4. **Add Environment Variable:**
   - Variables tab → Add `GOOGLE_SERVICE_ACCOUNT`
5. **Deploy**

### Option 4: Render

1. **Go to [render.com](https://render.com)**
2. **New → Web Service**
3. **Connect your GitHub repository**
4. **Build settings:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. **Add Environment Variable:**
   - Environment → Add `GOOGLE_SERVICE_ACCOUNT`
6. **Deploy**

## Important Notes

⚠️ **Security:**
- Never commit your `.env.local` file to GitHub
- Always set environment variables in your hosting platform's dashboard
- The `.gitignore` file already excludes `.env.local` files

✅ **After Deployment:**
- Make sure your Google Sheets are still shared with: `dashboard-sheet@dashboard-479519.iam.gserviceaccount.com`
- Test the dashboard to ensure data is loading correctly
- Check the browser console for any errors

## Troubleshooting

### "GOOGLE_SERVICE_ACCOUNT environment variable is not set"
- Verify the environment variable is set in your hosting platform
- Make sure the JSON is properly formatted (single line, escaped quotes)
- Redeploy after adding the environment variable

### "Failed to fetch data"
- Check that Google Sheets are shared with the service account
- Verify the service account email is correct
- Check the hosting platform logs for detailed errors

### Build fails
- Make sure all dependencies are in `package.json`
- Check that Node.js version is compatible (18+)
- Review build logs for specific errors

## Quick Deploy with Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add GOOGLE_SERVICE_ACCOUNT
# Paste your JSON when prompted

# Redeploy with environment variable
vercel --prod
```

