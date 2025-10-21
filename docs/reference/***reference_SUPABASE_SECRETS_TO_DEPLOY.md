# 🔑 SUPABASE SECRETS FOR EDGE FUNCTION DEPLOYMENT

## 📋 **Instructions:**
1. Go to **Supabase Dashboard** → **Settings** → **Edge Functions** → **Secrets**
2. **Copy and paste** these commands **one by one**:

---

## 🚀 **Secrets to Add:**

### **1. Employes.nl API Key**
```bash
npx supabase secrets set EMPLOYES_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcnRlbUB0ZWRkeWtpZHMubmwiLCJqdGkiOiIxNjZkZjFlMi1kOWQzLTQ5MWQtYmE1My05M2YyNzk0YjYzOGIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJDb21wYW55T3duZXIiLCJleHAiOjE3OTA0OTg4NDgsImlzcyI6Imh0dHBzOi8vYXBpLWRldi5lbXBsb3llcy5ubCIsImF1ZCI6Imh0dHBzOi8vYXBpLWRldi5lbXBsb3llcy5ubCJ9.bB7clTxWrcKM9CULkyjpgXgYtJscLAhlmXN-FPmIbIY"
```

### **2. Supabase Service Role Key**
```bash
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc5MDA0MywiZXhwIjoyMDcyMzY2MDQzfQ.VMV7A7Qi3xHERzThHVLACDbaC_ha00Fko5KqMIHa65Q"
```

### **3. Supabase URL**
```bash
npx supabase secrets set SUPABASE_URL="https://gjlgaufihseaagzmidhc.supabase.co"
```

---

## 🎯 **Alternative: Use Supabase Dashboard**

If CLI commands don't work, use the **web dashboard**:

1. Go to: **https://supabase.com/dashboard/project/gjlgaufihseaagzmidhc/settings/edge-functions**
2. Add these **Key-Value pairs**:

| Secret Name | Secret Value |
|-------------|--------------|
| `EMPLOYES_API_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcnRlbUB0ZWRkeWtpZHMubmwiLCJqdGkiOiIxNjZkZjFlMi1kOWQzLTQ5MWQtYmE1My05M2YyNzk0YjYzOGIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJDb21wYW55T3duZXIiLCJleHAiOjE3OTA0OTg4NDgsImlzcyI6Imh0dHBzOi8vYXBpLWRldi5lbXBsb3llcy5ubCIsImF1ZCI6Imh0dHBzOi8vYXBpLWRldi5lbXBsb3llcy5ubCJ9.bB7clTxWrcKM9CULkyjpgXgYtJscLAhlmXN-FPmIbIY` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc5MDA0MywiZXhwIjoyMDcyMzY2MDQzfQ.VMV7A7Qi3xHERzThHVLACDbaC_ha00Fko5KqMIHa65Q` |
| `SUPABASE_URL` | `https://gjlgaufihseaagzmidhc.supabase.co` |

---

## ✅ **After Adding Secrets:**

**Run this to deploy the function:**
```bash
npx supabase functions deploy employes-integration
```

---

## 🎉 **Expected Result:**
- Function should deploy without timeout
- New raw data storage functionality will be available
- Sync will store data with timestamps in `employes_raw_data` table

**Let me know when you've added the secrets and I'll help test the deployment!** 🚀