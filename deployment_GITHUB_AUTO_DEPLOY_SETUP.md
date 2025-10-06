# 🚀 **GITHUB AUTO-DEPLOYMENT SETUP GUIDE**

> **Automatically deploy Supabase functions when you push to GitHub!** ⚡

---

## 🎯 **What This Does**

Every time you push changes to `supabase/functions/` or `supabase/config.toml`, GitHub will automatically:
1. ✅ Deploy your functions to Supabase
2. ✅ Update environment secrets
3. ✅ Notify you of success/failure

---

## 🔑 **Required GitHub Secrets**

You need to add these secrets to your GitHub repository:

### 1. **SUPABASE_ACCESS_TOKEN**
- **What:** Your personal Supabase access token
- **How to get:**
  1. Go to [Supabase Dashboard](https://app.supabase.com)
  2. Click your profile (top right)
  3. Go to "Access Tokens"
  4. Create a new token with "All permissions"
  5. Copy the token

### 2. **SUPABASE_PROJECT_ID**
- **What:** Your project ID
- **Value:** `gjlgaufihseaagzmidhc` (already in your config.toml)

### 3. **EMPLOYES_API_KEY**
- **What:** Your Employes.nl JWT token
- **Value:** The same JWT from your `.env` file:
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcnRlbUB0ZWRkeWtpZHMubmwiLCJqdGkiOiIxNjZkZjFlMi1kOWQzLTQ5MWQtYmE1My05M2YyNzk0YjYzOGIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJDb21wYW55T3duZXIiLCJleHAiOjE3OTA0OTg4NDgsImlzcyI6Imh0dHBzOi8vYXBpLWRldi5lbXBsb3llcy5ubCIsImF1ZCI6Imh0dHBzOi8vYXBpLWRldi5lbXBsb3llcy5ubCJ9.bB7clTxWrcKM9CULkyjpgXgYtJscLAhlmXN-FPmIbIY
  ```

---

## 🛠️ **How to Add GitHub Secrets**

### Step 1: Navigate to Repository Settings
1. Go to your GitHub repository
2. Click "Settings" tab
3. In left sidebar, click "Secrets and variables" → "Actions"

### Step 2: Add Each Secret
1. Click "New repository secret"
2. Add each secret one by one:

```
Name: SUPABASE_ACCESS_TOKEN
Value: [your_supabase_token_here]
```

```
Name: SUPABASE_PROJECT_ID
Value: gjlgaufihseaagzmidhc
```

```
Name: EMPLOYES_API_KEY
Value: [your_employes_jwt_token_here]
```

---

## 🧪 **How to Test Auto-Deployment**

### Option 1: Push a Change
1. Make ANY change to `supabase/functions/employes-integration/index.ts`
2. Commit and push to main branch
3. GitHub will auto-deploy! 🚀

### Option 2: Manual Trigger
1. Go to your repo → "Actions" tab
2. Click "Deploy Supabase Functions" workflow
3. Click "Run workflow" → "Run workflow"

---

## 🎯 **Deployment Triggers**

Auto-deployment happens when you push changes to:
- `supabase/functions/**` (any function files)
- `supabase/config.toml` (configuration changes)

**Branches:** `main` or `master`

---

## 📊 **Monitoring Deployments**

### GitHub Actions Tab
- Go to your repo → "Actions" tab
- See all deployment runs, logs, and status

### Success Indicators
- ✅ Green checkmark = Deployment successful
- ❌ Red X = Deployment failed (check logs)

### Logs Location
- Click on any workflow run
- Click "deploy" job
- Expand steps to see detailed logs

---

## 🔧 **Troubleshooting**

### ❌ "Authentication failed"
- **Problem:** Invalid SUPABASE_ACCESS_TOKEN
- **Solution:** Regenerate token in Supabase dashboard

### ❌ "Project not found"
- **Problem:** Wrong SUPABASE_PROJECT_ID
- **Solution:** Check project ID in your Supabase dashboard URL

### ❌ "Function deployment failed"
- **Problem:** Code syntax error or missing dependencies
- **Solution:** Check workflow logs for specific error

### ❌ Workflow doesn't trigger
- **Problem:** Changes not in trigger paths
- **Solution:** Make sure you're editing files in `supabase/functions/` or `supabase/config.toml`

---

## 🎉 **Benefits of Auto-Deployment**

### ✅ **No Manual Commands**
- No more `npx supabase functions deploy`
- Just push to GitHub!

### ✅ **Consistent Environment**
- Same deployment process every time
- No "works on my machine" issues

### ✅ **Team Collaboration**
- Anyone can deploy by pushing code
- No special setup needed for team members

### ✅ **Deployment History**
- See all deployments in GitHub Actions
- Easy to track what changed when

### ✅ **Automatic Secret Management**
- Secrets are automatically updated
- No manual secret setting needed

---

## 🔄 **Workflow File Location**

The auto-deployment is configured in:
```
.github/workflows/deploy-supabase.yml
```

You can modify this file to:
- Change trigger conditions
- Add notification integrations (Slack, Discord, etc.)
- Add additional deployment steps
- Customize deployment behavior

---

## 🚨 **Security Notes**

### ✅ **Secrets are Safe**
- GitHub secrets are encrypted
- Only visible during workflow execution
- Never logged or exposed

### ✅ **Limited Scope**
- Tokens only have permissions you grant
- Workflows only run on your code changes
- No external access to secrets

### ⚠️ **Best Practices**
- Regularly rotate access tokens
- Use minimal required permissions
- Monitor deployment logs for suspicious activity

---

## 🎯 **Next Steps**

1. **Add the GitHub secrets** (most important!)
2. **Push a small change** to test auto-deployment
3. **Check GitHub Actions** to see it working
4. **Enjoy never manually deploying again!** 🎉

---

**🚀 You're all set for automatic deployments!**

*Last updated: 2025-01-27*
*Status: Ready to Use ✅*