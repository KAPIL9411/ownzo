# Firestore Index Setup Guide

## 🔥 Problem
You're seeing these errors in production:
```
FAILED_PRECONDITION: The query requires an index
```

This happens because **Firestore requires composite indexes** for queries that filter/sort on multiple fields.

---

## ✅ Solution: Deploy Firestore Indexes

### Method 1: Automatic Deployment (Recommended)

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Initialize Firebase in your project** (if not done):
```bash
cd /Users/pradeepkumar/Downloads/ownzo-main
firebase init firestore
```
Select:
- Use existing project: `ownzo-68cc6`
- Firestore rules file: `firestore.rules` (press Enter)
- Firestore indexes file: `firestore.indexes.json` (press Enter)

4. **Deploy the indexes**:
```bash
firebase deploy --only firestore:indexes
```

This will create ALL required indexes automatically! ⚡

---

### Method 2: Manual Creation via Console

If you prefer to create indexes manually, follow these links from the error messages:

#### For Offers (sellerId):
https://console.firebase.google.com/v1/r/project/ownzo-68cc6/firestore/indexes?create_composite=Ckpwcm9qZWN0cy9vd256by02OGNjNi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvb2ZmZXJzL2luZGV4ZXMvXxABGgwKCHNlbGxlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg

#### For Offers (buyerId):
https://console.firebase.google.com/v1/r/project/ownzo-68cc6/firestore/indexes?create_composite=Ckpwcm9qZWN0cy9vd256by02OGNjNi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvb2ZmZXJzL2luZGV4ZXMvXxABGgsKB2J1eWVySWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC

Click each link → Click "Create Index" → Wait 2-5 minutes for creation

---

## 📋 What Indexes Are Needed?

Our `firestore.indexes.json` includes indexes for:

### Listings
- Filter by status + sort by createdAt
- Filter by status + category + sort by createdAt
- Filter by status + city + sort by createdAt
- Filter by status + community + sort by createdAt
- Filter by status + condition + sort by createdAt
- Filter by status + sort by price (ascending/descending)
- Filter by status + sort by views
- Filter by sellerId + status + sort by createdAt

### Offers ⚠️ (Currently Missing - Causing Errors)
- Filter by listingId + status + sort by createdAt
- Filter by userId + status + sort by createdAt
- **Filter by sellerId + sort by createdAt** ← Missing!
- **Filter by buyerId + sort by createdAt** ← Missing!

### Buy Requests
- Filter by status + sort by createdAt
- Filter by status + city + sort by createdAt
- Filter by status + category + sort by createdAt
- Filter by userId + status + sort by createdAt
- Filter by status + community + sort by createdAt

### Chats
- Filter by buyerId + sort by updatedAt
- Filter by sellerId + sort by updatedAt
- Filter by buyRequestId + sellerId

### Messages
- Filter by chatId + sort by createdAt

### Notifications
- Filter by userId + sort by createdAt
- Filter by userId + read status + sort by createdAt

### Wishlist
- Filter by userId + sort by createdAt
- Filter by userId + listingId

### Reviews
- Filter by sellerId + sort by createdAt
- Filter by listingId + sort by createdAt

### Communities
- Filter by type + sort by members
- Filter by city + sort by members

### Community Join Requests
- Filter by status + sort by createdAt
- Filter by communityId + status + sort by createdAt
- Filter by userId + communityId + status

### Reports
- Filter by reporterId + targetId + type
- Filter by status + sort by createdAt

---

## ⏱️ Index Creation Time

- Simple indexes: **~30 seconds**
- Complex indexes: **2-5 minutes**
- All indexes together: **5-10 minutes**

You'll see "Building" status in Firebase Console → Firestore → Indexes tab.

---

## 🧪 Testing After Deployment

Once indexes are created:

1. **Refresh your app** at www.ownzo.in
2. **Try the features that were failing**:
   - View offers (as buyer/seller)
   - Browse listings
   - Check notifications
   - View buy requests
3. **Check Vercel logs** - should see 200 responses instead of 500

---

## 🚨 Common Issues

### Issue 1: "Firebase CLI not found"
**Solution:**
```bash
npm install -g firebase-tools
```

### Issue 2: "Permission denied"
**Solution:**
```bash
firebase login
# Select your Google account that owns the Firebase project
```

### Issue 3: "Project not found"
**Solution:**
```bash
firebase use ownzo-68cc6
```

### Issue 4: "Index already exists"
**Solution:** This is fine! It means the index was created before. Skip to next index.

### Issue 5: Indexes taking too long
**Solution:** Be patient. Complex indexes can take 5-10 minutes. Check progress:
```
Firebase Console → Firestore → Indexes
```

---

## 📊 Index Status Monitoring

### Check Index Status:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **ownzo-68cc6** project
3. Click **Firestore Database** → **Indexes** tab
4. Look for status:
   - 🟢 **Enabled** - Ready to use
   - 🟡 **Building** - Wait 2-5 minutes
   - 🔴 **Error** - Check error message, retry deployment

---

## 🔄 Quick Commands Reference

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Select project
firebase use ownzo-68cc6

# Deploy only indexes (fast)
firebase deploy --only firestore:indexes

# Deploy indexes + rules
firebase deploy --only firestore

# Check which project you're using
firebase projects:list

# View current indexes
firebase firestore:indexes
```

---

## 📝 Step-by-Step for Non-Technical Users

1. **Open Terminal** (Mac) or Command Prompt (Windows)

2. **Navigate to your project**:
```bash
cd /Users/pradeepkumar/Downloads/ownzo-main
```

3. **Install Firebase tools** (one-time only):
```bash
npm install -g firebase-tools
```

4. **Login to Firebase**:
```bash
firebase login
```
A browser will open → Select your Google account → Allow access

5. **Deploy indexes**:
```bash
firebase deploy --only firestore:indexes
```

6. **Wait 5-10 minutes** for indexes to build

7. **Check Firebase Console**:
   - Go to https://console.firebase.google.com
   - Select **ownzo-68cc6**
   - Click **Firestore Database** → **Indexes**
   - Wait until all show "Enabled" status

8. **Test your app** at www.ownzo.in

---

## ✅ Success Indicators

After successful deployment:
- ✅ No more "FAILED_PRECONDITION" errors in Vercel logs
- ✅ Offers page loads correctly
- ✅ All queries return 200 status
- ✅ Firebase Console shows all indexes as "Enabled"

---

## 🆘 Still Having Issues?

If indexes are deployed but errors persist:

1. **Clear browser cache** and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check Vercel logs** for new error messages
3. **Verify all indexes show "Enabled"** in Firebase Console
4. **Wait 5 more minutes** - sometimes propagation takes time
5. **Redeploy Vercel** - trigger new deployment to refresh

---

## 📚 Additional Resources

- [Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Composite Index Guide](https://firebase.google.com/docs/firestore/query-data/index-overview#composite_indexes)

---

**Status:** 🔴 Indexes need to be deployed
**Priority:** 🔥 HIGH - Blocking production features
**Time Required:** 10-15 minutes (mostly waiting for index creation)
