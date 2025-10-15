# 🚀 Deployment Guide - GiveNTake

Complete guide to deploy GiveNTake to production for the NYU Vibe Coding Hackathon.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ Supabase project set up with all tables
- ✅ Google AI API key (for Gemini 2.0 Flash)
- ✅ Code pushed to GitHub
- ✅ No TypeScript errors (`npm run build` succeeds locally)
- ✅ Environment variables ready

---

## 🎯 Option 1: Deploy to Vercel (Recommended - 10 minutes)

**Why Vercel?**
- ✅ Perfect for Next.js projects
- ✅ Free tier with custom domains
- ✅ Automatic HTTPS
- ✅ Git-based deployments
- ✅ Built-in CI/CD

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Import** your GiveNTake repository
5. **Configure Project:**
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

6. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_API_KEY=your_google_ai_key
   ```

7. **Click "Deploy"** and wait 2-3 minutes

8. **Done!** Your app will be live at `your-project.vercel.app`

### Step 3: Test Your Deployment

Visit your Vercel URL and test:
- ✅ Sign up / Login works
- ✅ Create listing works
- ✅ AI generation works
- ✅ Browse listings works
- ✅ Wishlist works
- ✅ No console errors

### Step 4: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records
4. Wait for SSL certificate (automatic)

---

## 🎯 Option 2: Deploy to Render (Alternative - 15 minutes)

**Why Render?**
- ✅ Free tier with 750 hours/month
- ✅ Simple PostgreSQL hosting
- ✅ Good for full-stack apps

### Steps:

1. **Go to Render**: https://render.com
2. **Sign in** with GitHub
3. **New → Web Service**
4. **Connect** your GiveNTake repository
5. **Configure:**
   - Name: `giventake`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: `Free`

6. **Add Environment Variables** (same as Vercel)

7. **Create Web Service** and wait 5-10 minutes

8. **Test** your deployment

---

## 🎯 Option 3: Deploy to Firebase App Hosting (Using existing apphosting.yaml)

Your project already has `apphosting.yaml` configured!

### Steps:

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize (if needed):**
   ```bash
   firebase init hosting
   ```

4. **Set Environment Variables** in Firebase Console:
   - Go to: https://console.firebase.google.com
   - Select your project
   - Settings → App Hosting → Environment Variables
   - Add your Supabase and Google AI keys

5. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

6. **Your app is live!**

---

## 🔧 Environment Variables Reference

All deployments need these environment variables:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key | Supabase Dashboard → Settings → API |
| `GOOGLE_API_KEY` | Google AI (Gemini) API key | https://aistudio.google.com/app/apikey |

**Important:** 
- Never commit `.env.local` to GitHub
- Use platform-specific environment variable settings
- Test variables are set correctly after deployment

---

## 🧪 Post-Deployment Testing

### Critical Tests:

1. **Authentication Flow**
   - [ ] Sign up with new email
   - [ ] Login with credentials
   - [ ] Logout works
   - [ ] Profile loads

2. **Core Features**
   - [ ] Create listing (with images)
   - [ ] AI generation works (key feature!)
   - [ ] Browse listings
   - [ ] Search works
   - [ ] Category filtering

3. **Advanced Features**
   - [ ] Create wishlist item
   - [ ] Create collection
   - [ ] View user profiles
   - [ ] Statistics page loads

4. **Mobile Testing**
   - [ ] Responsive on phone
   - [ ] All features work on mobile
   - [ ] Images load properly

5. **Performance**
   - [ ] Pages load in <2 seconds
   - [ ] No console errors
   - [ ] Images optimized

---

## 🐛 Common Issues & Solutions

### Issue: "Error loading page"
**Solution:** Check environment variables are set correctly in deployment platform

### Issue: "Supabase connection failed"
**Solution:** 
- Verify Supabase URL and key are correct
- Check Supabase project is active
- Verify RLS policies are enabled

### Issue: "AI generation not working"
**Solution:**
- Check `GOOGLE_API_KEY` is set
- Verify API key has Gemini 2.0 Flash enabled
- Check API quota hasn't been exceeded

### Issue: "Images not uploading"
**Solution:**
- Check Supabase storage bucket exists
- Verify RLS policies allow uploads
- Check file size limits

### Issue: "Build fails"
**Solution:**
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run typecheck

# Check for linting errors
npm run lint
```

---

## 📊 Performance Optimization Tips

### 1. Image Optimization
- Already using Next.js Image component ✅
- Consider adding image CDN for production

### 2. Database Optimization
- RLS policies already enabled ✅
- Indexes on key columns ✅
- Consider connection pooling for high traffic

### 3. Caching
- Vercel automatically caches static assets ✅
- Consider adding Redis for session storage (advanced)

### 4. Monitoring
**Recommended (Post-Launch):**
- Vercel Analytics (built-in)
- Sentry for error tracking
- Google Analytics for user metrics

---

## 🔒 Security Checklist

Before going live:

- ✅ Environment variables not in code
- ✅ RLS policies enabled on all tables
- ✅ API keys secured
- ✅ HTTPS enabled (automatic on Vercel/Render)
- ✅ Input validation on forms
- ✅ Authentication required for actions
- ✅ File upload size limits

---

## 📈 Scaling Considerations

### Current Setup (Free Tier)
- Works for: 100-1,000 daily active users
- Supabase: 500MB database, 1GB bandwidth
- Vercel: Unlimited bandwidth, 100GB hours

### If Traffic Grows
1. **Upgrade Supabase** to Pro ($25/month)
   - 8GB database
   - 50GB bandwidth
   - Daily backups

2. **Upgrade Vercel** to Pro ($20/month)
   - Priority support
   - Advanced analytics
   - Team collaboration

3. **Add Caching Layer**
   - Redis for session management
   - CDN for images

---

## 🎬 For Hackathon Demo

### Before Recording Video:
1. Deploy to production
2. Test all features work
3. Add sample data (listings, wishlist, collections)
4. Create test user account
5. Open site in clean browser (no dev tools)

### Demo URL Checklist:
- [ ] URL is short and memorable
- [ ] HTTPS enabled (green lock)
- [ ] No errors on homepage
- [ ] Sample data looks good
- [ ] Mobile version works

---

## 📞 Support & Troubleshooting

### Vercel Support
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/next.js/discussions

### Supabase Support
- Docs: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions

### Next.js Issues
- Docs: https://nextjs.org/docs
- GitHub: https://github.com/vercel/next.js

---

## ✅ Deployment Success Checklist

Before submitting to hackathon:

- [ ] Website is live and accessible
- [ ] All features tested and working
- [ ] No console errors on any page
- [ ] Mobile responsive verified
- [ ] AI generation tested successfully
- [ ] Demo account created with sample data
- [ ] URL added to hackathon submission form
- [ ] Screenshot/video of working site captured

---

## 🎉 You're Live!

Once deployed:

1. **Add URL to README.md:**
   ```markdown
   ## 🌐 Live Demo
   Check out the live site: [https://your-app.vercel.app](https://your-app.vercel.app)
   ```

2. **Update Hackathon Submission:**
   - Add deployment URL to submission form
   - Mention production deployment in demo video
   - Include URL in HACKATHON_SUBMISSION.md

3. **Share with Team/Friends:**
   - Get feedback before final submission
   - Test on different devices
   - Check loading times

---

**Built with ❤️ for NYU Vibe Coding Hackathon 2025**

**Need help?** Check the issues section or contact hackathon support.

---

*Last Updated: October 15, 2025*  
*Deployment Status: Ready for Production 🚀*
