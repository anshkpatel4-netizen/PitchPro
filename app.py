from flask import Flask, render_template, make_response, request, jsonify
from pathlib import Path
import base64
import shutil
import subprocess
import tempfile
import os

from dotenv import load_dotenv
from groq import Groq

import Firebasehelper


# =========================
# ENVIRONMENT
# =========================

load_dotenv()


# =========================
# GROQ
# =========================

api_key = os.environ.get("GROQ_API_KEY")

if not api_key:
    raise RuntimeError(
        "GROQ_API_KEY is missing. Add it to your .env file."
    )

client = Groq(
    api_key=api_key
)


# =========================
# FLASK
# =========================

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024 * 1024


DRILLS = {
    "one-touch-finishing": {"name": "One-Touch Finishing", "category": "Finishing", "difficulty": "Beginner", "duration": "10 min", "xp": "+10 XP", "icon": "◎", "summary": "Build calm, clean finishes when the ball arrives quickly in front of goal.", "equipment": "1 ball, 1 goal, and a partner or rebounder", "focus": "Clean contact and finishing before the goalkeeper can set.", "steps": ["Start six to eight yards from goal with your body open to the passer.", "Check your shoulder, then move across the defender line to create a clear angle.", "Meet the pass with your non-kicking foot beside the ball and keep your head steady.", "Guide the finish into the far corner with a relaxed ankle; reset quickly for the next ball."], "points": ["Stay on your toes", "Attack the ball, do not wait for it", "Pick a corner early", "Land balanced after contact"], "mistakes": ["Swinging too hard", "Leaning back and lifting the ball", "Taking an extra touch"], "video_query": "one touch finishing soccer drill tutorial"},
    "weak-foot-finishing": {"name": "Weak-Foot Finishing", "category": "Finishing", "difficulty": "Intermediate", "duration": "12 min", "xp": "+15 XP", "icon": "↗", "summary": "Make your weaker foot dependable so defenders cannot force you onto one side.", "equipment": "1 ball, 1 goal, and four cones", "focus": "Repetition, body shape, and placement over power.", "steps": ["Place two cones outside the box to create a left and right starting gate.", "Receive on your weaker foot and take one touch across your body.", "Finish with the laces for power or the inside for placement.", "Complete five finishes from each side, then increase the pass speed."], "points": ["Point your toe down", "Open your hip toward the target", "Keep the ankle firm", "Celebrate clean technique, not just goals"], "mistakes": ["Avoiding the weaker side", "Watching the ball too long", "Trying to hit every shot at maximum power"], "video_query": "weak foot finishing soccer drill tutorial"},
    "first-touch-shooting": {"name": "First-Touch Shooting", "category": "Finishing", "difficulty": "Beginner", "duration": "10 min", "xp": "+10 XP", "icon": "◉", "summary": "Turn your first touch into the setup for a fast, accurate shot.", "equipment": "1 ball, 1 goal, and a partner or wall", "focus": "First touch into space, then finish in two actions.", "steps": ["Start central with your back half-turned to goal.", "Receive the pass on the back foot and cushion it into your shooting lane.", "Keep the next step short so the ball stays within striking distance.", "Shoot before the second touch gets away from you."], "points": ["Scan before receiving", "Cushion the ball", "Touch forward, not sideways", "Get your eyes up before the shot"], "mistakes": ["Stopping the ball dead", "Taking a giant setup touch", "Standing flat-footed"], "video_query": "first touch shooting soccer drill tutorial"},
    "cone-slalom": {"name": "Cone Slalom", "category": "Dribbling", "difficulty": "Beginner", "duration": "8 min", "xp": "+10 XP", "icon": "⌁", "summary": "Improve close control and rhythm while changing direction through tight spaces.", "equipment": "1 ball and 6 cones", "focus": "Small touches with both feet and your head up.", "steps": ["Set six cones one yard apart in a straight line.", "Dribble through using the inside of both feet, keeping the ball within one step.", "Repeat with only your right foot, then only your left foot.", "Finish each run with a five-yard acceleration."], "points": ["Use the correct surface", "Keep knees soft", "Stay light between touches", "Accelerate out of the final cone"], "mistakes": ["Knocking cones over", "Looking down the whole time", "Using only your dominant foot"], "video_query": "cone slalom dribbling soccer drill tutorial"},
    "change-of-direction-moves": {"name": "Change-of-Direction Moves", "category": "Dribbling", "difficulty": "Intermediate", "duration": "12 min", "xp": "+15 XP", "icon": "↯", "summary": "Learn to sell a change of direction, protect the ball, and explode away.", "equipment": "1 ball and 4 cones", "focus": "Deceleration, deception, and acceleration.", "steps": ["Dribble toward a cone at a controlled pace.", "Slow down with two short touches and shift your weight over the ball.", "Use a drag, inside cut, or outside cut to move around the cone.", "Push the ball into space and sprint for three steps."], "points": ["Lower your center of gravity", "Sell the fake with your eyes and shoulders", "Touch the ball past the defender", "Accelerate immediately"], "mistakes": ["Changing direction without slowing", "Standing upright", "Taking the escape touch too close"], "video_query": "change of direction dribbling soccer drills tutorial"},
    "wall-passing": {"name": "Wall Passing", "category": "Passing", "difficulty": "Beginner", "duration": "8 min", "xp": "+10 XP", "icon": "↔", "summary": "Build reliable passing technique and a sharp first touch with simple repetitions.", "equipment": "1 ball and a safe, flat wall", "focus": "Weight of pass, receiving angle, and rhythm.", "steps": ["Stand four to six yards from the wall with the ball on your front foot.", "Pass through the middle of the ball with the inside of your foot.", "Receive across your body and play the next pass in one or two touches.", "Switch feet every five passes and gradually move farther away."], "points": ["Plant beside the ball", "Follow through toward the target", "Receive on the back foot", "Keep the rhythm consistent"], "mistakes": ["Passing with the toe", "Letting the ball get under your feet", "Ignoring the non-dominant foot"], "video_query": "wall passing soccer drill tutorial"},
    "receive-across-the-body": {"name": "Receive Across the Body", "category": "Passing", "difficulty": "Intermediate", "duration": "10 min", "xp": "+15 XP", "icon": "↔", "summary": "Open your body on the first touch so you can play forward instead of backward.", "equipment": "1 ball and a partner or wall", "focus": "Checking away, scanning, and receiving on the back foot.", "steps": ["Start side-on to the passer with space behind your shoulder.", "Check away, then check back toward the ball to create separation.", "Receive with the foot farthest from the passer and take your touch across your body.", "Play forward with the next pass or carry into the open space."], "points": ["Scan before the ball arrives", "Show the correct passing lane", "Soften the receiving foot", "Open your hips to the field"], "mistakes": ["Receiving square", "Taking the touch behind you", "Checking only once"], "video_query": "receive across body soccer first touch drill"},
    "shoulder-check-routine": {"name": "Shoulder-Check Routine", "category": "Game IQ", "difficulty": "Beginner", "duration": "6 min", "xp": "+10 XP", "icon": "⌾", "summary": "Create the habit of scanning before receiving so your next decision is faster.", "equipment": "1 ball and a partner or open space", "focus": "Information before the ball arrives.", "steps": ["Before the pass, look over both shoulders and name what you see.", "Move into a new angle instead of waiting in the same lane.", "Scan again as the ball travels, then receive with your body open.", "Add a passive defender or a color call to make the decision realistic."], "points": ["Scan early", "Scan again while the ball travels", "Use your information", "Move after you pass"], "mistakes": ["Only looking at the ball", "Scanning without changing position", "Forgetting the second scan"], "video_query": "soccer scanning shoulder check receiving drill"}
}


# =========================
# PAGES
# =========================

@app.route("/")
def home():
    return render_template("pitchpro2.html")


@app.route("/programs")
def programs():
    return render_template("programs-page.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/drills")
def drills():
    return render_template("drills-page.html")


@app.route("/foundation")
def foundation():
    return render_template("foundation.html")


@app.route("/drills-library")
def drill_library():
    return render_template("drills-library-page.html")


@app.route("/drills/<slug>")
def drill_detail(slug):
    drill = DRILLS.get(slug)
    if drill is None:
        return "Drill not found", 404
    return render_template("drill-detail.html", drill=drill, slug=slug)


@app.route("/tips")
def tips():
    return render_template("tips-page.html")


@app.route("/about")
def about():
    return render_template("about-page.html")


@app.route("/get-started")
def get_started():
    return render_template("get-started-page.html")


@app.route("/customize")
def customize():
    return render_template("customize.html")


@app.route("/signup")
def signup():
    return render_template("signup-page.html")


@app.route("/login")
def login():
    return render_template("login-page.html")


@app.route("/ai-coach")
def ai_coach():
    return render_template("ai-coach.html")


@app.route("/tactical-coach")
def tactical_coach():
    return render_template("tactical-coach.html")


@app.route("/team")
def team_hub():
    return render_template("team-hub.html")


@app.route("/user/<username>")
def user(username):
    return f"Hello, {username}!"


# =========================
# LOGIN API
# =========================

@app.route("/api/login", methods=["POST", "GET"])
def apilogin():

    if request.method == "POST":

        uname = request.form["name"]
        pwd = request.form["pwd"]

        if Firebasehelper.Authenticate(uname, pwd):

            resp = make_response(
                "logged in successfully",
                200
            )

            resp.set_cookie(
                "user",
                "username=" + uname
            )

            return resp

        return "login failed", 401

    else:

        uname = request.args.get(
            "name",
            ""
        )

        return "username is " + uname


# =========================
# AI COACH API
# =========================

@app.route("/api/ai-coach", methods=["POST"])
def chat():

    data = request.get_json(
        silent=True
    ) or {}

    conversation = data.get(
        "messages",
        []
    )


    # -------------------------
    # Validate request
    # -------------------------

    if not conversation:

        return jsonify({
            "error": "No conversation provided."
        }), 400


    # -------------------------
    # Keep only valid messages
    # -------------------------

    cleaned_conversation = []

    for message in conversation:

        if not isinstance(message, dict):
            continue

        role = message.get("role")
        content = message.get("content")

        if role not in [
            "user",
            "assistant",
            "system"
        ]:
            continue

        if not content:
            continue

        cleaned_conversation.append({
            "role": role,
            "content": str(content)
        })


    if not cleaned_conversation:

        return jsonify({
            "error": "No valid messages provided."
        }), 400


    # -------------------------
    # Server-side system prompt
    # -------------------------

    system_prompt = """
You are PitchPro AI Coach, an AI soccer coach inside the PitchPro
youth soccer training platform.

Your job is to help young soccer players improve their soccer skills,
understanding, confidence, and preparation.

You can help with:

- Finishing
- First touch
- Dribbling
- Passing
- Movement
- Positioning
- Game intelligence
- 1v1 ability
- Speed and agility
- Striker training
- Match preparation
- Soccer rules
- Soccer terminology
- Tactics
- Training ideas
- Confidence and mindset

Give practical, age-appropriate advice.

When giving training sessions:

- Organize them into clear steps.
- Include realistic durations when useful.
- Focus on technique and quality.
- Include rest and recovery.
- Avoid extreme exercise.
- Do not recommend restrictive eating.
- Encourage working with the player's real coach.

Keep answers easy to understand and useful for a young soccer player.

If the user asks something unrelated to soccer, politely redirect
the conversation toward soccer coaching.

You are a coach, not a replacement for the player's real coach.
"""


    # -------------------------
    # Only send recent messages
    # -------------------------

    recent_messages = cleaned_conversation[-10:]


    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    messages.extend(recent_messages)


    # -------------------------
    # Call Groq
    # -------------------------

    try:

        response = client.chat.completions.create(

            model="openai/gpt-oss-20b",

            messages=messages,

            temperature=0.7,

            reasoning_effort="low",

            max_completion_tokens=1500
        )


        answer = response.choices[
            0
        ].message.content


        if not answer:

            return jsonify({
                "error": "The AI Coach returned an empty response."
            }), 500


        return jsonify({
            "reply": answer
        })


    except Exception as e:

        print(
            "Groq AI Coach error:",
            repr(e)
        )

        return jsonify({
            "error": "Could not get a response from PitchPro AI Coach."
        }), 500


@app.route("/api/ai-coach/video", methods=["POST"])
def analyze_match_video():
    """Analyze a long match upload with audio transcription and sampled frames."""
    video = request.files.get("video")
    if video is None or not video.filename:
        return jsonify({"error": "Choose a match video to upload."}), 400

    allowed_extensions = {"mp4", "mov", "m4v", "webm", "avi"}
    extension = Path(video.filename).suffix.lower().lstrip(".")
    if extension not in allowed_extensions:
        return jsonify({"error": "Upload an MP4, MOV, M4V, WEBM, or AVI video."}), 400

    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        return jsonify({
            "error": "Match analysis needs FFmpeg installed on the server. Install ffmpeg and ffprobe, then try again."
        }), 503

    temp_dir = tempfile.mkdtemp(prefix="pitchpro-match-")
    input_path = Path(temp_dir) / f"match.{extension}"
    audio_path = Path(temp_dir) / "match.wav"
    frames_dir = Path(temp_dir) / "frames"
    frames_dir.mkdir()

    try:
        video.save(input_path)

        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(input_path)],
            check=True,
            capture_output=True,
            text=True,
            timeout=60,
        )
        duration = float(probe.stdout.strip())
        if duration < 60 * 60 or duration > 100 * 60:
            return jsonify({"error": "Please upload a match between 60 and 100 minutes long."}), 400

        subprocess.run(
            ["ffmpeg", "-y", "-i", str(input_path), "-vn", "-ac", "1", "-ar", "16000", str(audio_path)],
            check=True,
            capture_output=True,
            timeout=20 * 60,
        )

        with audio_path.open("rb") as audio_file:
            transcript_result = client.audio.transcriptions.create(
                file=("match.wav", audio_file.read(), "audio/wav"),
                model="whisper-large-v3-turbo",
                response_format="text",
            )
        transcript = getattr(transcript_result, "text", transcript_result) or "No spoken commentary detected."

        frame_count = 8
        interval = max(duration / (frame_count + 1), 1)
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(input_path), "-vf", f"fps=1/{interval}", "-frames:v", str(frame_count), str(frames_dir / "frame-%02d.jpg")],
            check=True,
            capture_output=True,
            timeout=10 * 60,
        )
        frames = []
        for frame_path in sorted(frames_dir.glob("frame-*.jpg"))[:frame_count]:
            encoded = base64.b64encode(frame_path.read_bytes()).decode("ascii")
            frames.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded}"}})

        analysis_prompt = f"""
Analyze this soccer match for a youth player. The video is approximately {round(duration / 60)} minutes long.
Use the sampled frames as visual context and the transcript as commentary context.
Return a concise but useful report with: 1) three strengths, 2) three priorities to improve, 3) positioning and decision-making notes, 4) a 7-day training plan, and 5) two moments the player should review with a real coach.
Do not pretend the sampled frames show every play. Clearly label anything that is uncertain.

Transcript:
{transcript[:30000]}
"""
        vision_content = [{"type": "text", "text": analysis_prompt}, *frames]
        try:
            response = client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[{"role": "user", "content": vision_content}],
                temperature=0.3,
                max_completion_tokens=2200,
            )
        except Exception:
            response = client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=[{"role": "user", "content": analysis_prompt}],
                temperature=0.3,
                reasoning_effort="low",
                max_completion_tokens=2200,
            )

        return jsonify({
            "reply": response.choices[0].message.content,
            "durationMinutes": round(duration / 60, 1),
            "framesReviewed": len(frames),
        })
    except subprocess.CalledProcessError:
        return jsonify({"error": "The video could not be decoded. Try exporting it as an MP4 (H.264 video with AAC audio)."}), 400
    except Exception as error:
        print("Match video analysis error:", repr(error))
        return jsonify({"error": "The match could not be analyzed right now. Check the video format and try again."}), 500
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


# =========================
# RUN SERVER
# =========================

if __name__ == "__main__":

    app.run(
        debug=True,
        use_reloader=False
    )
