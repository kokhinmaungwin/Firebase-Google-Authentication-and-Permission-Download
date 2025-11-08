# 🔐 Firebase Google Auth + Permission Based App Download System

This project is a **secure Firebase authentication + download access control system** built using **Firebase Auth, Firestore, and Storage**.

Only allowed users (whitelisted emails) are able to download specific app files.  
Admin users can grant access to new users from the admin dashboard.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
✅ Google Login | Secure Firebase Authentication  
✅ Admin Dashboard | Manage allowed users  
✅ Firestore Permission Check | Control who can download app files  
✅ Live User List | Real-time Firestore updates  
✅ Multi-File Support | Download files based on app ID  
✅ Auto Redirect Download | Start download if permitted  
✅ Client-side JavaScript | Modern Firebase v9 Modular SDK  

---

## 📂 Firestore Structure

### Collection: `admins`
| Field | Type | Example |
|------|------|--------|
`isAdmin` | boolean | `true`

Document ID = Firebase UID of admin user  

---

### Collection: `allowedUsers`
| Field | Type | Example |
|------|------|--------|
`allowed` | boolean | `true`  
`grantedBy` | string | admin@gmail.com  
`grantedAt` | string | ISO date  

Document ID = email of user

---

### Collection: `download_links`

| Field | Type | Example |
|------|------|--------|
`url` | string | https://yourapp.com/app.apk  
`filename` | string | app-release.apk  

Document ID = `appId` used in HTML button

---

## 🛠️ Tech Stack

- Firebase Authentication (Google Sign-In)
- Firestore Database
- Firebase Storage
- Vanilla JavaScript (ES Modules)
- HTML + CSS

---

## 🚀 How to Use

1️⃣ Replace Firebase Config with your credentials  
2️⃣ Create Firestore collections as shown above  
3️⃣ Add your admin UID in `admins` collection  
4️⃣ Deploy and login  
5️⃣ Admin can whitelist users to allow downloads  

---

## 🔑 Security Notes

- Only authenticated users can access download system  
- Admin role enforced using Firestore rules
- Whitelist email must exist in `allowedUsers`

🔒 Do NOT expose private Firebase keys in public projects.  
Environment variables recommended for production.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Created by _Khin Maung Win_**  
🚀 Firebase Secure Download System  
📅 2025

If you like this project, ⭐ star the repo and support future work!
