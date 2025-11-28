# Vercel Domain Configuration Guide

## Common "Invalid Configuration" Issues and Solutions

### 1. **DNS Records Not Configured**

Vercel needs specific DNS records to be added to your domain's DNS settings.

#### For Root Domain (e.g., `yourdomain.com`):

Add these DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

**Option A: A Records (Recommended for root domain)**
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600 (or Auto)
```

**Option B: CNAME Record**
```
Type: CNAME
Name: @ (or leave blank)
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

#### For Subdomain (e.g., `www.yourdomain.com` or `dashboard.yourdomain.com`):

```
Type: CNAME
Name: www (or your subdomain name)
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

### 2. **Step-by-Step Fix Process**

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Add your domain (e.g., `yourdomain.com`)
   - Vercel will show you the exact DNS records needed
   - **Copy the DNS records shown** (they might be different from above)

2. **In Your Domain Registrar:**
   - Log into your domain registrar (where you bought the domain)
   - Go to DNS Management / DNS Settings
   - Find the DNS records section
   - Add the records exactly as Vercel shows them
   - Save the changes

3. **Wait for DNS Propagation:**
   - DNS changes can take 5 minutes to 48 hours
   - Usually takes 10-30 minutes
   - You can check propagation at: https://dnschecker.org

4. **Verify in Vercel:**
   - Go back to Vercel → Settings → Domains
   - Click "Refresh" or wait for automatic verification
   - Status should change from "Invalid Configuration" to "Valid Configuration"

### 3. **Common Mistakes**

❌ **Wrong DNS Record Type:**
- Using A record when CNAME is needed (or vice versa)
- **Fix:** Use the exact record type Vercel specifies

❌ **Wrong Record Value:**
- Using old/incorrect IP addresses or CNAME values
- **Fix:** Use the exact values Vercel provides in the domain settings

❌ **Multiple Conflicting Records:**
- Having both A and CNAME records for the same name
- **Fix:** Remove conflicting records, use only what Vercel recommends

❌ **DNS Not Propagated:**
- Changes just made, DNS hasn't updated yet
- **Fix:** Wait 10-30 minutes and check again

### 4. **Domain Verification**

Vercel needs to verify you own the domain. This happens automatically when DNS records are correct.

**If verification fails:**
- Make sure DNS records are exactly as Vercel shows
- Wait for DNS propagation (check with dnschecker.org)
- Remove any conflicting DNS records
- Try removing and re-adding the domain in Vercel

### 5. **Quick Checklist**

- [ ] DNS records added in domain registrar
- [ ] Record type matches Vercel's requirement (A or CNAME)
- [ ] Record value matches exactly what Vercel shows
- [ ] Waited at least 10 minutes for DNS propagation
- [ ] Checked DNS propagation with dnschecker.org
- [ ] No conflicting DNS records exist
- [ ] Domain is not already connected to another Vercel project

### 6. **Troubleshooting Commands**

Check your DNS records from terminal:
```bash
# Check A records
nslookup yourdomain.com

# Check CNAME records
nslookup -type=CNAME www.yourdomain.com

# Check all records
dig yourdomain.com
```

### 7. **Still Not Working?**

1. **Remove and Re-add Domain:**
   - In Vercel: Settings → Domains → Remove domain
   - Wait 5 minutes
   - Add domain again
   - Follow the DNS setup instructions

2. **Check Vercel Status:**
   - Visit https://vercel-status.com
   - Check if there are any ongoing issues

3. **Contact Vercel Support:**
   - If DNS is correct but still showing invalid
   - Vercel Support: support@vercel.com
   - Include screenshots of your DNS settings

### 8. **For Different Domain Providers**

**GoDaddy:**
- DNS Management → Add Record → Use Vercel's values

**Namecheap:**
- Advanced DNS → Add New Record → Use Vercel's values

**Cloudflare:**
- DNS → Add Record → Use Vercel's values
- Make sure proxy is OFF (gray cloud) for DNS records

**Google Domains:**
- DNS → Custom Records → Add → Use Vercel's values

### 9. **SSL Certificate**

Once DNS is configured correctly:
- Vercel automatically provisions SSL certificates
- This takes 5-10 minutes after DNS is verified
- Your site will be available at `https://yourdomain.com`

## Need Help?

If you're still stuck, share:
1. The exact error message from Vercel
2. Your domain name
3. Screenshot of your DNS records (hide sensitive info)
4. What domain registrar you're using

