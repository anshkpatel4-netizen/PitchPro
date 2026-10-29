
import {
    auth, 
    db, 
} from "./firebase.js";

import {
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    updateDoc,
    getDoc, 
}  from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  const buttons = document.querySelectorAll(".complete-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const card = button.closest(".drill-card")
      console.log(card)
      const xpAmount = parseInt(card.querySelector(".xp").textContent)
      console.log(xpAmount)
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const data = snap.data();
      let NewXp = (data.xp || 0) + xpAmount;
      let NewLevel = (data.level || 1);

      let LeveledUp = false;
      
      if (NewXp >= 100){
        NewLevel++; 
        NewXp -= 100;
        LeveledUp = true;
      } 

      await updateDoc(userRef, {
        xp: NewXp,
        level: NewLevel,
        LevelUp: LeveledUp,
        sessionsCompleted: (data.sessionsCompleted || 0) + 1
      });

      button.textContent = "Completed";
      button.disabled = true;
    });
  });
});
































