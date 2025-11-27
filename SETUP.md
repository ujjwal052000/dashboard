# Setup Guide - Google Sheets Service Account

## Environment Variables Setup

Create a `.env.local` file in the root directory with your Google Service Account credentials.

### Option 1: Single-line JSON (Recommended)

Copy your entire service account JSON and paste it as a single-line string:

```env
GOOGLE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id","private_key_id":"your-private-key-id","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"your-service-account@your-project.iam.gserviceaccount.com","client_id":"your-client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```

**Note:** Replace all placeholder values with your actual service account credentials from Google Cloud Console.

### Option 2: Using a JSON file (Alternative)

If you prefer, you can store the service account JSON in a file and reference it, but the single-line approach above is simpler for Next.js.

## Important: Share Sheets with Service Account

You need to share your Google Sheets with the service account email address:

**Service Account Email:** `your-service-account@your-project.iam.gserviceaccount.com`

### Steps to Share:

1. Open each Google Sheet you want to access
2. Click the "Share" button (top right)
3. Add the service account email: `your-service-account@your-project.iam.gserviceaccount.com`
4. Set permission to "Viewer" (read-only is sufficient)
5. Click "Send" or "Done"

**Sheets to share:**
- TEST SHEET 1: `your-spreadsheet-id-1`
- TEST SHEET 2: `your-spreadsheet-id-2`

## Verify Setup

After setting up the `.env.local` file and sharing the sheets:

1. Restart your development server
2. Open the dashboard
3. You should see data loading from your Google Sheets

If you encounter errors, check:
- The `.env.local` file is in the root directory
- The JSON is properly formatted (single-line, escaped quotes)
- The sheets are shared with the service account email
- The Google Sheets API is enabled in your Google Cloud project

