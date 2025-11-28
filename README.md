# Modern Dashboard UI - Google Sheets Integration

A modern, responsive dashboard that connects to Google Sheets and displays data in real-time with automatic updates.

## Features

- 📊 **Real-time Data Sync**: Automatically fetches data from Google Sheets
- 🔄 **Auto-refresh**: Updates every 30 seconds (configurable)
- 📈 **Interactive Charts**: Visualize your data with pie charts, bar charts, and more
- 📋 **Flexible Data Table**: Displays all columns from your sheets with sorting
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support
- 🔍 **Filtering**: Filter data by category, region, and date range

## Setup Instructions

### 1. Configure Environment Variables

Create a `.env.local` file in the root directory with your Google Service Account credentials.

**Service Account Email:** `dashboard-sheet@dashboard-479519.iam.gserviceaccount.com`

See [SETUP.md](./SETUP.md) for detailed instructions on setting up the environment variables.

Quick setup - paste your service account JSON into your `.env.local` file:

```env
GOOGLE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id","private_key_id":"your-private-key-id","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"your-service-account@your-project.iam.gserviceaccount.com","client_id":"your-client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```

**Note:** Replace all placeholder values with your actual service account credentials from Google Cloud Console.

### 2. Share Your Google Sheets with Service Account

You need to share your Google Sheets with the service account email:

**Service Account Email:** `dashboard-sheet@dashboard-479519.iam.gserviceaccount.com`

1. Open each Google Sheet
2. Click "Share" button (top right)
3. Add the email: `dashboard-sheet@dashboard-479519.iam.gserviceaccount.com`
4. Set permission to "Viewer"
5. Click "Done"

**Sheets to share:**
- **TEST SHEET 1**: `1DkTBIBQc7xe_hEGM6prdIhOKE8dLMS4HvhD8KBQKQBA`
  - DRIP
  - 1-1 email outreacxh
- **TEST SHEET 2**: `1U9TQAvyO3gL9KXncq-CVq6wKZO-qhSzSntFlnMMu_2s`
  - Linkeidn Outreach
  - Calling

### 3. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 4. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. The dashboard fetches data from your Google Sheets via the Google Sheets API
2. Data is automatically refreshed every 30 seconds
3. You can manually refresh by clicking the "Refresh" button
4. Toggle auto-refresh on/off as needed
5. Select which data sources (sheets) to display
6. View data in interactive charts and sortable tables

## Data Structure

The dashboard automatically detects:
- **Numeric columns**: Used for charts and calculations
- **Date columns**: Used for time-based analysis
- **Category columns**: Used for filtering and grouping

All columns from your sheets are displayed in the data table, regardless of structure.

## Deployment

For production deployment, you need to set the `GOOGLE_SERVICE_ACCOUNT` environment variable in your hosting platform.

**⚠️ Important:** GitHub Pages does NOT support Next.js API routes. Use one of these platforms instead:
- **Vercel** (Recommended) - Best for Next.js apps
- **Netlify** - Good alternative
- **Railway** or **Render** - Other options

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel:

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Import your repository: `ujjwal052000/dashboard`
3. Add environment variable:
   - Go to Project Settings → Environment Variables
   - Add `GOOGLE_SERVICE_ACCOUNT` with your service account JSON
4. Deploy! Your app will be live at `https://your-project.vercel.app`

## Troubleshooting

### "GOOGLE_SERVICE_ACCOUNT environment variable is not set"
**For Local Development:**
- Make sure you've created a `.env.local` file in the root directory
- Verify the JSON is properly formatted (single-line, all quotes escaped)
- Restart the development server after adding the environment variable

**For Production/Deployment:**
- Set the environment variable in your hosting platform (Vercel, Netlify, etc.)
- Make sure the variable is set for the correct environment (Production/Preview)
- Redeploy after adding the environment variable
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for platform-specific instructions

### "Failed to fetch sheet data"
- Verify your Google Sheets are shared with `dashboard-sheet@dashboard-479519.iam.gserviceaccount.com`
- Check that the service account has "Viewer" permission
- Ensure the Google Sheets API is enabled in your Google Cloud project
- Check the browser console and server logs for detailed error messages

### No data showing
- Check that your sheets have data (not just headers)
- Verify the sheet names match exactly (case-sensitive)
- Check the browser console for error messages

## Customization

To add more sheets or change sheet configurations, edit `app/api/sheets/route.ts` and update the `SHEET_CONFIGS` object.

## Tech Stack

- **Next.js 16**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Recharts**: Chart library
- **shadcn/ui**: UI components
- **Google Sheets API**: Data source

