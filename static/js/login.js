import {
  auth,
  signInWithEmailAndPassword,
  provider,
  signInWithPopup,
  setDoc,
  updateDoc,
  getDoc, 
  doc,
  db,
} from "./firebase.js";

document.getElementById("loginBtn").addEventListener("click", async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;


  try {

    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(doc(db, "users", credential.user.uid), { role }, { merge: true });

    window.location.href = "/dashboard";

  } catch (error) {

    alert(error.message);

  }

});

document.getElementById("google-btn").addEventListener("click", async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;


  try {
  
    const result = await signInWithPopup(
      auth,
      provider,
    );

    const user = result.user;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()){
      await setDoc(ref, {
        firstName:"Pitch",
        lastName:"Pro",
        dob: "06162026",
        program: "beginner",
        email: user.email,
        position: "Striker",
        foot_type: "ambipedal",
        xp: 0,
        level: 1,
        sessionsCompleted: 0,
        role,
      } 
      )
    } else {
      await updateDoc(ref, { role });
    }

    window.location.href = "/dashboard";

  } catch (error) {

    alert(error.message);

  }

});
