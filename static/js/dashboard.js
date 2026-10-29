console.log("dashboard.js loaded");

import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  doc,
  getDoc,
  updateDoc,
} from "./firebase.js";

function getRank(level) {
  if (level >= 20) return "Elite Player";
  if (level >= 10) return "Gold Player";
  if (level >= 5) return "Silver Player";
  return "Bronze Player";
}

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "/login";
    return;
  }

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  document.getElementById("welcomeName").innerText =
    data.firstName;

  document.getElementById("name").innerText =
    data.firstName + " " + data.lastName;

  document.getElementById("program").innerText =
    "🏆 " + data.program;

  document.getElementById("position").innerText =
    "⚽ " + data.position;

  const avatar = document.getElementById("avatar");
  const avatarFallback = (data.firstName || "P").charAt(0).toUpperCase();
  if (data.profilePhoto) {
    avatar.innerText = "";
    avatar.style.backgroundImage = `url(${data.profilePhoto})`;
    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center";
  } else {
    avatar.style.backgroundImage = "";
    avatar.innerText = avatarFallback;
  }

  const xp = data.xp || 0;
  const level = data.level || 1;
  const sessions = data.sessionsCompleted || 0;

  if (data.LevelUp) {
      showLevelUp((data.level || 1) - 1, data.level || 1);

      await updateDoc(userRef, {
          LevelUp: false
      });
    }

  document.getElementById("xp").innerText = xp;
  document.getElementById("level").innerText = level;
  document.getElementById("sessions").innerText = sessions;

  document.getElementById("rank").innerText =
    getRank(level);

  const xpFill = document.getElementById("xpFill");
  const xpText = document.getElementById("xpText");

  if (xpFill) {
    xpFill.style.width = xp + "%";
  }

  if (xpText) {
    xpText.innerText = `${xp} / 100 XP`;
  }

});

// Complete Training Session
document
  .getElementById("completeSessionBtn")
  .addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();

    let xp = (data.xp || 0) + 10;
    let level = data.level || 1;
    let sessions = (data.sessionsCompleted || 0) + 1;
    

    const oldLevel = level;
    const oldRank = getRank(level);

    if (xp >= 100) {
      level++;
      xp = 0;

      showLevelUp(oldLevel, level);

      const newRank = getRank(level);

      if (oldRank !== newRank) {
        setTimeout(() => {
          showPromotion(oldRank, newRank);
        }, 1200);
      }
    }

    await updateDoc(ref, {
  xp,
  level,
  sessionsCompleted: sessions
});

// Instant dashboard update
document.getElementById("xp").innerText = xp;
document.getElementById("level").innerText = level;
document.getElementById("sessions").innerText = sessions;

document.getElementById("rank").innerText =
  getRank(level);

document.getElementById("xpFill").style.width =
  xp + "%";

document.getElementById("xpText").innerText =
  `${xp} / 100 XP`;

// Only reload after level-up animation
if (xp === 0) {
  setTimeout(() => {
    location.reload();
  }, 4500);
}

  });

function showPromotion(oldRank, newRank) {

  const modal = document.getElementById("rankModal");

  document.getElementById("oldRank").textContent = oldRank;
  document.getElementById("newRank").textContent = newRank;

  modal.classList.add("show");

  confetti({
    particleCount: 250,
    spread: 120,
    origin: { y: 0.6 }
  });

  setTimeout(() => {
    modal.classList.remove("show");
  }, 4000);

}

function showLevelUp(oldLevel, newLevel) {

  confetti({
    particleCount: 350,
    spread: 300
  });

  const levelCard =
    document.getElementById("level").parentElement;

  levelCard.classList.add("levelup");

  document.getElementById("rank").innerHTML =
    `LEVEL UP! ⚽<br>Level ${oldLevel} → ${newLevel}`;

  setTimeout(() => {
    levelCard.classList.remove("levelup");
  }, 1400);

}

// Logout
document
  .getElementById("logoutBtn")
  .addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "/login";

  });
