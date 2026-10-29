console.log("customize.js loaded");

import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc
} from "./firebase.js";

// =====================
// Form Fields
// =====================

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const bio = document.getElementById("bio");
const number = document.getElementById("number");
const position = document.getElementById("position");
const foot = document.getElementById("foot");
const club = document.getElementById("club");
const player = document.getElementById("player");
const matchesPlayed = document.getElementById("matchesPlayed");
const minutesPlayed = document.getElementById("minutesPlayed");
const goals = document.getElementById("goals");
const assists = document.getElementById("assists");
const passAccuracy = document.getElementById("passAccuracy");
const successfulDribbles = document.getElementById("successfulDribbles");
const tacklesWon = document.getElementById("tacklesWon");
const interceptions = document.getElementById("interceptions");

// =====================
// Preview
// =====================

const previewName = document.getElementById("previewName");
const previewPosition = document.getElementById("previewPosition");
const previewNumber = document.getElementById("previewNumber");
const avatarPreview = document.getElementById("avatarPreview");
const photo = document.getElementById("photo");

let currentUser = null;
let savedPhoto = "";
let pendingPhoto = null;

// =====================
// Live Preview
// =====================

function setAvatar(element, imageData, fallback) {
    if (imageData) {
        element.textContent = "";
        element.style.backgroundImage = `url(${imageData})`;
        element.style.backgroundSize = "cover";
        element.style.backgroundPosition = "center";
    } else {
        element.style.backgroundImage = "";
        element.textContent = fallback;
    }
}

function updatePreview() {

    previewName.textContent =
        `${firstName.value} ${lastName.value}`.trim() || "Your Name";

    previewPosition.textContent =
        position.value;

    previewNumber.textContent =
        number.value || "10";

    setAvatar(
        avatarPreview,
        pendingPhoto || savedPhoto,
        (firstName.value.charAt(0) || "A").toUpperCase()
    );

}

[
    firstName,
    lastName,
    bio,
    number,
    position,
    foot,
    club,
    player
    , matchesPlayed, minutesPlayed, goals, assists, passAccuracy, successfulDribbles, tacklesWon, interceptions
].forEach(input => {

    input.addEventListener("input", updatePreview);

});

// =====================
// Load Player Data
// =====================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "/login";
        return;
    }

    currentUser = user;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();
    savedPhoto = data.profilePhoto || "";

    firstName.value = data.firstName || "";
    lastName.value = data.lastName || "";
    bio.value = data.bio || "";
    number.value = data.jerseyNumber || "";
    position.value = data.position || "";
    foot.value = data.preferredFoot || "";
    club.value = data.favoriteClub || "";
    player.value = data.favoritePlayer || "";
    const matchStats = data.matchStats || {};
    matchesPlayed.value = matchStats.matchesPlayed || 0;
    minutesPlayed.value = matchStats.minutesPlayed || 0;
    goals.value = matchStats.goals || 0;
    assists.value = matchStats.assists || 0;
    passAccuracy.value = matchStats.passAccuracy || 0;
    successfulDribbles.value = matchStats.successfulDribbles || 0;
    tacklesWon.value = matchStats.tacklesWon || 0;
    interceptions.value = matchStats.interceptions || 0;

    updatePreview();

});

photo.addEventListener("change", () => {
    const file = photo.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
        alert("Please choose an image file.");
        photo.value = "";
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        alert("Please choose an image smaller than 10 MB.");
        photo.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const image = new Image();
        image.onload = () => {
            const maxSize = 512;
            const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(image.width * scale));
            canvas.height = Math.max(1, Math.round(image.height * scale));
            canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
            pendingPhoto = canvas.toDataURL("image/jpeg", 0.82);
            updatePreview();
        };
        image.src = reader.result;
    };
    reader.readAsDataURL(file);
});

// =====================
// Save Changes
// =====================

document.querySelector(".save").addEventListener("click", async () => {

    if (!currentUser) return;

    const ref = doc(db, "users", currentUser.uid);

    const saveButton = document.querySelector(".save");
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    await setDoc(ref, {

    firstName: firstName.value,
    lastName: lastName.value,
    bio: bio.value,
    jerseyNumber: Number(number.value),
    position: position.value,
    preferredFoot: foot.value,
    favoriteClub: club.value,
    favoritePlayer: player.value,
    profileCompleted: true,
    profilePhoto: pendingPhoto || savedPhoto || ""
    ,matchStats: {
        matchesPlayed: Number(matchesPlayed.value) || 0,
        minutesPlayed: Number(minutesPlayed.value) || 0,
        goals: Number(goals.value) || 0,
        assists: Number(assists.value) || 0,
        passAccuracy: Number(passAccuracy.value) || 0,
        successfulDribbles: Number(successfulDribbles.value) || 0,
        tacklesWon: Number(tacklesWon.value) || 0,
        interceptions: Number(interceptions.value) || 0
    }

}, { merge: true });

    savedPhoto = pendingPhoto || savedPhoto || "";
    pendingPhoto = null;
    saveButton.disabled = false;
    saveButton.textContent = "Save Changes";
    alert("✅ Player customization saved!");

});
