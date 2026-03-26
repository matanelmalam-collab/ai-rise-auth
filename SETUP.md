# AI Rise Auth Gateway — Setup & Deployment Guide

## Overview
This is the Hebrew auth gateway for AI Rise. It replaces Base44's English-only login with a warm, Hebrew, mobile-first signup experience powered by Clerk.

**Auth methods:** Email Magic Link · SMS OTP · Google OAuth
**Domain:** login.ai-rise.co.il
**Stack:** Next.js 15 + Clerk + Vercel

---

## Phase 1: Clerk Account Setup (15 minutes)

### 1.1 Create Clerk Account
1. Go to https://clerk.com and sign up
2. Create a new application: **"AI Rise Israel"**
3. In the setup wizard, select: **Email**, **Phone**, **Google**

### 1.2 Configure Email Magic Link
1. Go to **Configure → Email, Phone, Username**
2. Under "Email address": toggle ON
3. Click the gear icon → set "Email verification link" as authentication strategy
4. Toggle "Require" ON for email address

### 1.3 Enable SMS OTP (requires Pro plan)
1. Go to **Billing** → upgrade to Pro plan ($20/mo)
2. Go to **Configure → Email, Phone, Username**
3. Under "Phone number": toggle ON "Sign-up with phone" and "Sign-in with phone"
4. Toggle ON "Verify at sign-up"
5. **CRITICAL:** Go to **Configure → SMS → Settings**
6. Add **Israel (+972)** to the SMS country allowlist (only US/Canada are enabled by default)

### 1.4 Enable Google OAuth
1. Go to **Configure → Social Connections** → Enable **Google**
2. Go to https://console.cloud.google.com
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized redirect URI from Clerk dashboard
5. Copy Client ID and Client Secret back to Clerk

### 1.5 Branding
1. Go to **Customization → Branding**
2. Upload AI Rise logo
3. Set primary color: `#C8813A`
4. Toggle OFF "Secured by Clerk" badge (available on Pro plan)

### 1.6 Copy API Keys
1. Go to **API Keys**
2. Copy `Publishable Key` (starts with `pk_`)
3. Copy `Secret Key` (starts with `sk_`)
4. Save both — you'll need them for deployment

---

## Phase 2: Local Development (30 minutes)

### 2.1 Prerequisites
- Node.js 18+ installed
- Git installed

### 2.2 Setup
```bash
cd ai-rise-auth
npm install

# Copy env template
cp .env.local.example .env.local
```

### 2.3 Fill in .env.local
Open `.env.local` and fill in:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_KEY
BASE44_APP_ID=your_base44_app_id
NEXT_PUBLIC_BASE44_APP_URL=https://app.base44.com/apps/YOUR_APP
BRIDGE_SECRET=<run: openssl rand -hex 32>
```

### 2.4 Run Locally
```bash
npm run dev
```
Open http://localhost:3000/signup — you should see the Hebrew signup page.

### 2.5 Test Auth Flows
- **Magic Link:** Enter your email → check inbox → click link
- **SMS OTP:** Enter +972 phone → enter 6-digit code
- **Google:** Click "המשיכו עם Google" → complete OAuth flow
- **Clerk test mode:** Use `+clerk_test@gmail.com` emails and OTP `424242`

---

## Phase 3: Deploy to Vercel (20 minutes)

### 3.1 Push to GitHub
```bash
cd ai-rise-auth
git init
git add .
git commit -m "Initial commit: AI Rise Hebrew Auth Gateway"
git remote add origin https://github.com/YOUR_USERNAME/ai-rise-auth.git
git push -u origin main
```

### 3.2 Deploy on Vercel
1. Go to https://vercel.com → "Add New Project"
2. Import the `ai-rise-auth` GitHub repository
3. Framework: Next.js (auto-detected)
4. Add environment variables (same as .env.local, but with PRODUCTION keys):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → use `pk_live_` key from Clerk
   - `CLERK_SECRET_KEY` → use `sk_live_` key from Clerk
   - `BASE44_APP_ID`
   - `NEXT_PUBLIC_BASE44_APP_URL`
   - `BRIDGE_SECRET`
   - `NEXT_PUBLIC_COOKIE_DOMAIN` → `.ai-rise.co.il`
5. Click Deploy

### 3.3 Add Custom Domain
1. In Vercel project → Settings → Domains
2. Add: `login.ai-rise.co.il`
3. Vercel will show you the required DNS record

### 3.4 DNS Setup
Add this record at your domain registrar (where ai-rise.co.il is registered):

| Type  | Name  | Value                    |
|-------|-------|--------------------------|
| CNAME | login | cname.vercel-dns.com     |

Wait for DNS propagation (usually 5-30 minutes).

### 3.5 Configure Clerk Production Domain
1. In Clerk Dashboard → **Configure → Domains**
2. Add `login.ai-rise.co.il` as your production domain
3. Follow Clerk's verification steps

---

## Phase 4: Integration (10 minutes)

### 4.1 Update Landing Page CTA
In your Base44 landing page, change the CTA button URL:

**Before:** Points to Base44's built-in signup
**After:** `https://login.ai-rise.co.il/signup`

Also update any "Login" / "כניסה" links to:
`https://login.ai-rise.co.il/login`

### 4.2 Preserve UTM Parameters
Make sure your ad links pass UTMs through to the auth gateway:
```
https://login.ai-rise.co.il/signup?utm_source=facebook&utm_medium=cpc&utm_campaign=spring2026
```
The analytics module will automatically capture these.

### 4.3 Update Facebook Pixel ID
In `app/layout.tsx`, replace `YOUR_PIXEL_ID` with your actual Facebook Pixel ID.

---

## Phase 5: Testing Checklist

### Hebrew / RTL
- [ ] All text displays in Hebrew
- [ ] Layout is right-to-left
- [ ] Error messages appear in Hebrew
- [ ] Font is Heebo, 18px minimum body text
- [ ] Buttons are 48px+ height, gold (#C8813A)
- [ ] Cream (#FDFAF6) background
- [ ] No "Secured by Clerk" branding
- [ ] AI Rise logo displays correctly

### Auth Flows
- [ ] Email magic link: receive link, click, authenticated
- [ ] SMS OTP: receive code on +972 number, enter, authenticated
- [ ] Google OAuth: consent screen in Hebrew, authenticated
- [ ] New signup → Base44 account created → course dashboard
- [ ] Returning login → existing Base44 account → course dashboard

### Mobile (CRITICAL — 75% of traffic)
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Magic link email opens correctly on mobile
- [ ] No horizontal scrolling
- [ ] Keyboard doesn't obscure input fields
- [ ] All buttons are thumb-friendly (48px+ height)

### Session Bridge
- [ ] New signup → Base44 account auto-created
- [ ] Returning login → finds existing Base44 account
- [ ] No second signup prompt from Base44
- [ ] Email appears correctly in Base44 user profile

### Analytics
- [ ] GA4 receives auth_page_viewed events
- [ ] GA4 receives auth_completed events
- [ ] Facebook Pixel fires CompleteRegistration
- [ ] UTM parameters preserved in GA4

---

## Troubleshooting

### "Bridge failed" error on callback page
- Check that BASE44_APP_ID is correct
- Verify Base44 API endpoints are accessible
- Check Vercel function logs for detailed error

### SMS not arriving
- Verify Israel (+972) is in Clerk's SMS allowlist
- Check Clerk dashboard → Logs for SMS delivery status
- Phone number must include country code

### Hebrew text looks wrong
- Ensure `dir="rtl"` is on the html element
- Check that Heebo font is loading (Network tab)
- Clear Clerk's client cache: hard refresh (Ctrl+Shift+R)

### Cookie not sharing between domains
- Verify NEXT_PUBLIC_COOKIE_DOMAIN is `.ai-rise.co.il`
- Both sites must use HTTPS
- Check SameSite cookie policy

---

## Cost Summary

| Item | Monthly Cost |
|------|-------------|
| Clerk Pro | $20 |
| SMS (~100 messages to Israel) | ~$6 |
| Vercel Hobby | $0 |
| **Total** | **~$26/mo** |
