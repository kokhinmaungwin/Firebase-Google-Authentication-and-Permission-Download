import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "Your_API_Key_Here",
  authDomain: "Your_Name_Here.firebaseapp.com",
  projectId: "Your_ProjectId_Here",
  storageBucket: "Your_Name_Here.firebasestorage.app",
  messagingSenderId: "Your_Id_Here",
  appId: "Your_App_Id_Here"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const userEmailSpan = document.getElementById("userEmail");
const message = document.getElementById("message");
const adminPanel = document.getElementById("adminPanel");
const userEmailToGrantInput = document.getElementById("userEmailToGrant");
const grantPermissionBtn = document.getElementById("grantPermissionBtn");
const adminMessage = document.getElementById("adminMessage");
const allowedUsersListContainer = document.getElementById("allowedUsersListContainer");
const allowedUsersTableBody = document.getElementById("allowedUsersTableBody");
const noAllowedUsersMessage = document.getElementById("noAllowedUsersMessage");
const downloadLinks = document.querySelectorAll(".download-link"); 
let unsubscribeAllowedUsers = null;

// Login Handler
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    message.textContent = "";
  } catch (err) {
    message.style.color = "red";
    message.textContent = "Login failed: " + err.message;
  }
});
// Logout Handler
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    message.textContent = "";
  } catch (err) {
    console.error("Logout Error:", err);
  }
});
// Grant Permission Handler
grantPermissionBtn.addEventListener("click", async () => {
  const email = userEmailToGrantInput.value.trim();
  if (!email) {
    adminMessage.style.color = "red";
    adminMessage.textContent = "Please enter an email address.";
    return;
  }
  const user = auth.currentUser;
  if (!user) {
    adminMessage.style.color = "red";
    adminMessage.textContent = "You must be logged in to grant permissions.";
    return;
  }
// Check if current user is admin
  const adminDocRef = doc(db, "admins", user.uid);
  const adminDocSnap = await getDoc(adminDocRef);
  if (!adminDocSnap.exists() || adminDocSnap.data().isAdmin !== true) {
    adminMessage.style.color = "red";
    adminMessage.textContent = "You do not have administrative privileges to grant permissions.";
    return;
  }
  // Grant permission
  try {
    await setDoc(doc(db, "allowedUsers", email), {
      allowed: true,
      grantedBy: user.email,
      grantedAt: new Date().toISOString()
    });
    adminMessage.style.color = "green";
    adminMessage.textContent = `Permission granted to ${email} successfully!`;
    userEmailToGrantInput.value = "";
  } catch (e) {
    adminMessage.style.color = "red";
    adminMessage.textContent = `Error granting permission: ${e.message}`;
  }
});
// Load Allowed Users List (admin only)
function setupAllowedUsersListener() {
  if (unsubscribeAllowedUsers) {
    unsubscribeAllowedUsers();
    unsubscribeAllowedUsers = null;
  }
  const q = query(collection(db, "allowedUsers"), orderBy("grantedAt", "desc"));
  unsubscribeAllowedUsers = onSnapshot(q, (querySnapshot) => {
    allowedUsersTableBody.innerHTML = "";
 noAllowedUsersMessage.style.display = "none";
    if (querySnapshot.empty) {
 noAllowedUsersMessage.style.display = "block";
      return;
    }
    querySnapshot.forEach(docSnap => {
      const d = docSnap.data();
      allowedUsersTableBody.innerHTML += `
       <tr>
          <td>${docSnap.id}</td>
         <td>${d.grantedBy}</td>
          <td>${new Date(d.grantedAt).toLocaleString()}</td>
        </tr>
     `;
    });
    }, (error) => {
    console.error("Error fetching allowed users:", error);   noAllowedUsersMessage.style.display = "block";
    noAllowedUsersMessage.textContent = "Error loading allowed users list.";
  });
}
// Auth state changed
onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    userInfo.style.display = "block";
    userEmailSpan.textContent = user.email;
    message.textContent = "";
    downloadLinks.forEach(link => {
    link.style.display = "inline-block";
    });
// Check admin and show admin panel + user list if admin
    const adminDocRef = doc(db, "admins", user.uid);
    const adminDocSnap = await getDoc(adminDocRef);
    if (adminDocSnap.exists() && adminDocSnap.data().isAdmin === true) {
      adminPanel.style.display = "block";
      allowedUsersListContainer.style.display = "block";
      setupAllowedUsersListener();
    } else {
      adminPanel.style.display = "none";
      allowedUsersListContainer.style.display = "none";
      if (unsubscribeAllowedUsers) {
        unsubscribeAllowedUsers();
        unsubscribeAllowedUsers = null;
      }
    }
 } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    userInfo.style.display = "none";
    message.textContent = "";
    downloadLinks.forEach(link => {
      link.style.display = "none";
});
adminPanel.style.display = "none";
allowedUsersListContainer.style.display = "none";
    if (unsubscribeAllowedUsers) {
      unsubscribeAllowedUsers();
      unsubscribeAllowedUsers = null;
    }
  }
});
// Handle download link clicks and permission check
document.body.addEventListener("click", async (event) => {
  const targetLink = event.target.closest(".download-link");
  if (!targetLink) return;
  event.preventDefault();
  message.style.color = "black";
  message.textContent = "Checking permissions...";
  const user = auth.currentUser;
  if (!user) {
    message.style.color = "red";
    message.textContent = "Please login first.";
    return;
}
const appId = targetLink.dataset.appId;
  if (!appId) {
    message.style.color = "red";
    message.textContent = "Error: Download link is missing app ID.";
    return;
  }
  try {
    const allowedDocRef = doc(db, "allowedUsers", user.email);
    const allowedDocSnap = await getDoc(allowedDocRef);
    if (allowedDocSnap.exists() && allowedDocSnap.data().allowed === true) {
    message.style.color = "black";
    message.textContent = "Permission granted! Fetching download link...";
    const downloadDocRef = doc(db, "download_links", appId);
    const downloadDocSnap = await getDoc(downloadDocRef);
    if (downloadDocSnap.exists()) {
    const downloadData = downloadDocSnap.data();
    const fileURL = downloadData.url;
    const fileName = downloadData.filename || `${appId}.apk`;
       if (!fileURL) {
          message.style.color = "red";
          message.textContent = "Error: Download link URL not found in database.";
          return;
}
    message.style.color = "green";
    message.textContent = `Starting download of ${fileName}...`;
        const a = document.createElement("a");
        a.href = fileURL;
        a.setAttribute("download", fileName);
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
    message.style.color = "red";
    message.textContent = `Error: No download link configuration found for '${appId}'.`;
}
    } else {
    message.style.color = "red";
    message.textContent = "Sorry, you do not have permission to download.";
    }
  } catch (error) {
    message.style.color = "red";
    message.textContent = "Error checking permissions or fetching download link: " + error.message;
    console.error("Download error:", error);
  }
});
  
