
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  doc,
  setDoc
} from "./firebase.js";

const dobInput = document.getElementById("dob");
const roleInput = document.getElementById("role");
const roleOptions = document.querySelectorAll(".role-option");

roleOptions.forEach((option) => {
  option.addEventListener("click", () => {
    roleInput.value = option.dataset.role;
    const subtitle = document.getElementById("signupSubtitle");
    if (subtitle) {
      subtitle.textContent = option.dataset.role === "coach"
        ? "Create a coach account to build a team, support players, and assign focused training homework."
        : "Create a player account to train, track progress, join a team, and complete coach assignments.";
    }
    roleOptions.forEach((item) => {
      const selected = item === option;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
  });
});

dobInput.addEventListener("change", () => {

  const age = calculateAge(dobInput.value);

  const programs =
    getRecommendedPrograms(age);

  document.getElementById(
    "programRecommendations"
  ).innerHTML = `
    <h3>Recommended Programs</h3>
    ${programs.map(
      p => `<p>⚽ ${p}</p>`
    ).join("")}
  `;

});

function calculateAge(dob) {

  const birthDate = new Date(dob);
  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDiff =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 &&
     today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function getRecommendedPrograms(age) {

  if (age <= 7) {
    return ["Foundation Training"];
  }

  if (age <= 10) {
    return [
      "Foundation Training",
      "Ball Mastery"
    ];
  }

  if (age <= 13) {
    return [
      "Foundation Training",
      "Ball Mastery",
      "Game Intelligence"
    ];
  }

  if (age <= 16) {
    return [
      "Ball Mastery",
      "Game Intelligence",
      "Elite Preparation"
    ];
  }

  return [
    "Elite Preparation",
    "Mindset & Leadership",
    "Performance Pathway"
  ];
}

document.getElementById("signupBtn").addEventListener("click", async () => {

  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const dob = document.getElementById("dob").value;
  const age = calculateAge(dob);
  const recommendedPrograms = getRecommendedPrograms(age);
  const program = document.getElementById("program").value;
  const position = document.getElementById("position").value;
  const foot_type = document.getElementById("foot_type").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const role = roleInput.value;

  if (!firstName || !lastName || !email || !password) {
    alert("Fill in all fields");
    return;
  }

  if (!['player', 'coach'].includes(role)) {
    alert("Choose whether you are signing up as a player or coach");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
  firstName,
  lastName,
  role,
  dob,
  program,
  email,
  position,
  foot_type,
  xp: 0,
  level: 1,
  sessionsCompleted: 0,
  recommendedPrograms,

  createdAt: new Date()
});

    window.location.href = "/ai-coach?agenda=1";
    
  } catch (error) {
    alert(error.message);
  }

});
