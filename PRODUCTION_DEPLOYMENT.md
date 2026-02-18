# 🌐 Production Deployment Guide

Complete guide to deploy your Academic Credential System to production using Vercel and your custom domain (theabrar.in).

---

## 📋 What's Already Done

✅ **Smart Contract:** Deployed on Sepolia testnet  
✅ **Contract Address:** `0x7B5206a636d9D0819E469fA4dfABF0BE062e0297`  
✅ **Backend Configuration:** Complete  
✅ **Frontend Development:** Working locally  

**Now:** Deploy frontend so others can access it!

---

## 🚀 Step-by-Step Deployment

### Step 1: Test Production Build Locally

First, make sure the production build works:

```bash
# Navigate to frontend
cd frontend

# Build for production
npm run build

# Test the production build
npm run preview
```

Open http://localhost:4173/ and test:
- ✅ Connect wallet works
- ✅ All pages load
- ✅ No console errors

---

### Step 2: Push to GitHub

Make sure all changes are committed:

```bash
# Go to project root
cd ..

# Check status
git status

# Add all files
git add -A

# Commit
git commit -m "Prepare for production deployment with Sepolia"

# Push to GitHub
git push origin main
```

---

### Step 3: Deploy to Vercel

#### A. Create Vercel Account

1. **Go to:** https://vercel.com
2. **Sign up with GitHub** (recommended for easy deployment)
3. **Authorize Vercel** to access your repositories

#### B. Import Project

1. **Click "Add New Project"**
2. **Import** your GitHub repository:
   - Repository: `Tokenized-Academic-Credential-Verification-System`
3. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend` ⚠️ **CRITICAL - Must be set!**
   - **Build Command:** Leave default (`npm run build`)
   - **Output Directory:** Leave default (`dist`)
   - **Install Command:** Leave default (`npm install`)
   - **Node.js Version:** 18.x (if available in settings)

#### C. Add Environment Variables

In Vercel dashboard, click **"Environment Variables"** and add:

```
VITE_CONTRACT_ADDRESS=0x7B5206a636d9D0819E469fA4dfABF0BE062e0297
VITE_NETWORK_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
VITE_PINATA_API_KEY=28a729c26a1820589688
VITE_PINATA_API_SECRET=5d18a9a28fdca6c21ebd16cbfe7fe1491b3a602a98dd879ef5adbe8375696c9a
```

**Note:** These are safe to use in production (no private keys, contract is already deployed)

#### D. Deploy

1. **Click "Deploy"**
2. **Wait 2-3 minutes** for build to complete
3. **You'll get a URL** like: `https://your-project.vercel.app`

#### E. Test Deployment

1. **Open your Vercel URL**
2. **Connect MetaMask** (make sure you're on Sepolia network)
3. **Test all features:**
   - Connect wallet ✅
   - Issue credential ✅
   - View dashboard ✅
   - Verify credential ✅

---

### Step 4: Connect Custom Domain (theabrar.in)

#### A. Add Domain in Vercel

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. **Add domain:** `theabrar.in` or `credentials.theabrar.in`
3. **Vercel will show DNS instructions**

#### B. Configure DNS

Go to your domain registrar (where you bought theabrar.in) and add:

**Option 1: Use subdomain (Recommended)**
```
Type: CNAME
Name: credentials
Value: cname.vercel-dns.com
```

**Option 2: Use root domain**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Also add:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### C. Wait for DNS Propagation

- Usually takes **5-60 minutes**
- Check status: https://dnschecker.org/

#### D. Enable HTTPS

Vercel automatically provisions SSL certificate:
- Just wait a few minutes after DNS is configured
- Your site will be accessible at: `https://credentials.theabrar.in` or `https://theabrar.in`

---

## 🎓 For College Students to Use

### What Students Need:

1. **MetaMask Wallet:**
   - Install MetaMask browser extension
   - Create wallet
   - Switch to **Sepolia test network**
   - Get free Sepolia ETH from faucet (if needed for gas)

2. **Access Your Site:**
   - Visit: `https://credentials.theabrar.in` (or your chosen domain)
   - Click "Connect Wallet"
   - Approve MetaMask connection

### What Students Can Do:

**Regular Students (No special role):**
- ✅ View their own credentials (Dashboard)
- ✅ Verify any credential (Verify page)
- ✅ Share credential verification links

**You (Admin + Issuer):**
- ✅ Issue credentials to students
- ✅ Revoke credentials
- ✅ Grant issuer role to professors/staff

### How to Issue Credentials to Students:

1. **Collect student wallet addresses**
2. **Go to "Issue Credential"** page
3. **Fill in student details**
4. **Enter student's wallet address**
5. **Click "Issue Credential"**
6. **Approve transaction** in MetaMask
7. **Wait for confirmation** (~30 seconds)
8. **Student can now see credential** in their Dashboard

---

## 🔐 Security Notes

### What's Public (Safe):
✅ Contract address
✅ Network ID (Sepolia)
✅ Pinata API keys (read-only for frontend)
✅ IPFS gateway URL

### What's Private (Never Share):
⚠️ Your wallet private key
⚠️ Backend .env file (not deployed)
⚠️ Alchemy API key (stays in backend .env)

### Important:
- Frontend .env.production can be public (no sensitive data)
- Backend .env must stay private (has your wallet private key)
- Only you can issue/revoke credentials (you have admin role)

---

## 📊 Monitor Your Deployment

### Vercel Dashboard Shows:
- Deployment status
- Build logs
- Traffic analytics
- Error logs

### Etherscan Shows:
- All credential issuance transactions
- Contract interactions
- Gas usage

**Your Contract:** https://sepolia.etherscan.io/address/0x7B5206a636d9D0819E469fA4dfABF0BE062e0297

---

## 🎯 After Deployment

### Share with Students:

**Website URL:**
```
https://credentials.theabrar.in
```

**Instructions for Students:**

1. Install MetaMask
2. Create wallet
3. Switch to Sepolia network
4. Visit the website
5. Connect wallet
6. Provide wallet address to admin/issuer
7. Wait for credential to be issued
8. View credential in Dashboard

### For Professors/Staff:

If you want others to issue credentials:

1. **Get their wallet address**
2. **Run in browser console** (while connected to your site):
```javascript
// Grant ISSUER role
const issuerRole = await contract.ISSUER_ROLE();
await contract.grantRole(issuerRole, "0x...theirWalletAddress");
```

Or create a simple admin page in your app.

---

## 💡 Pro Tips

### Performance:
- ✅ Vercel serves from global CDN (fast worldwide)
- ✅ Automatic HTTPS
- ✅ Automatic deployments on git push

### Updates:
- Just push to GitHub main branch
- Vercel automatically rebuilds and deploys
- Zero downtime deployments

### Costs:
- ✅ Vercel: Free (hobby plan)
- ✅ Sepolia transactions: Free (test ETH)
- ✅ Pinata: Free tier (1 GB)
- ✅ Domain: Only cost (₹300-500/year for .in domain)

---

## 🆘 Troubleshooting

### Build Fails on Vercel with "Command exited with 1":

**Most Common Fix:**
1. **Go to Vercel Dashboard** → Your Project → **Settings** → **General**
2. **Scroll to "Build & Development Settings"**
3. **Set Root Directory:** `frontend` (NOT `./frontend`, NOT empty)
4. **Click "Save"**
5. **Go to Deployments** → Click "..." on latest deployment → **"Redeploy"**

**Alternative Fix:**
1. Delete the project from Vercel
2. Re-import with correct settings
3. Make sure to set **Root Directory: `frontend`** from the start

### Other Build Issues:

**Check:**
1. Root directory is set to `frontend` (most important!)
2. Build command is `npm run build` (or left as default)
3. Output directory is `dist` (or left as default)
4. All environment variables are added
5. Check build logs in Vercel for specific error messages

### Build Fails on Vercel:

**Check:**
1. Root directory is set to `frontend`
2. Build command is `npm run build`
3. All environment variables are added
4. No errors in Vercel build logs

### Site Loads but Wallet Won't Connect:

**Check:**
1. MetaMask is installed
2. User is on Sepolia network
3. Browser console for errors
4. Try hard refresh (Ctrl+Shift+R)

### Credentials Not Loading:

**Check:**
1. Contract address is correct in .env.production
2. Network ID is 11155111
3. User's wallet is connected
4. Check Etherscan for transaction status

### Domain Not Working:

**Check:**
1. DNS settings are correct
2. Wait for DNS propagation (up to 24 hours)
3. Use https:// not http://
4. Clear browser cache

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Site loads at your domain
- [ ] HTTPS is working (green padlock)
- [ ] Connect wallet works
- [ ] All pages load correctly
- [ ] Can issue credentials
- [ ] Students can view credentials
- [ ] Verify page works
- [ ] No console errors
- [ ] Works on mobile
- [ ] Works in different browsers

---

## 📱 Share with Students

**Create a guide for students:**

---

### 📧 Email Template for Students:

**Subject:** Access Your Academic Credentials on Blockchain

Dear Students,

We've deployed a blockchain-based credential verification system. Here's how to access your credentials:

**Step 1: Install MetaMask**
- Visit: https://metamask.io/
- Install browser extension
- Create a wallet

**Step 2: Switch to Sepolia Network**
- Open MetaMask
- Click network dropdown
- Select "Sepolia test network"
- (Enable test networks in Settings if not visible)

**Step 3: Get Sepolia Test ETH** (Optional, only if you want to test transactions)
- Visit: https://sepoliafaucet.com/
- Enter your wallet address
- Get free test ETH

**Step 4: Access the Platform**
- Visit: https://credentials.theabrar.in
- Click "Connect Wallet"
- Approve MetaMask connection

**Step 5: Share Your Wallet Address**
- Copy your address from MetaMask
- Send to: [your email]
- We'll issue your credential

**Step 6: View Your Credentials**
- After issuance, go to Dashboard
- View your credentials
- Share verification link with anyone

**Need Help?**
Contact: [your contact info]

---

**Congratulations! Your college project is now live and accessible to all students!** 🎓🚀

---

## 🔄 Optional: GitHub Pages Alternative

If you prefer not to use Vercel, you can also deploy to GitHub Pages (free):

1. Install gh-pages: `npm install -D gh-pages`
2. Add to package.json scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. Run: `npm run deploy`
4. Access at: `https://yourusername.github.io/repo-name/`

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Domain DNS Help:** Check your registrar's documentation
- **MetaMask Support:** https://support.metamask.io/
- **Project Issues:** GitHub repository issues tab

---

**Ready to deploy? Follow Step 1 above!** 🚀
