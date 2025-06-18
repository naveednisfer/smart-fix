# 🚨 Quick Fix for Network Errors

The network errors you're seeing are because Supabase credentials are not configured. Here's how to fix it:

## 🔧 **Immediate Fix**

### Option 1: Direct Configuration (Quick)
Edit `supabase.js` and replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://your-actual-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-actual-anon-key';
```

### Option 2: Environment Variables (Recommended)
1. Create a `.env` file in the root directory:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. Restart the Expo development server:
```bash
npx expo start --clear
```

## 📋 **Get Your Supabase Credentials**

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use existing one
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://abc123.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

## 🗄 **Set Up Database**

After getting credentials, run the SQL commands from `database-setup.sql` in your Supabase SQL Editor.

## ✅ **Test**

Once configured, the network errors should disappear and the app will work properly!

---

**Need help?** Check the main README.md for detailed instructions. 