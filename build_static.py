"""Build the Flask pages as files that GitHub Pages can serve.

GitHub Pages does not run Flask or Jinja, so this exporter turns the public
templates into plain HTML and rewrites Flask routes to .html links.
"""

from __future__ import annotations

import ast
import html
import re
from pathlib import Path
from urllib.parse import quote_plus


ROOT = Path(__file__).resolve().parent
TEMPLATES = ROOT / "templates"

ROUTES = {
    "programs": "programs.html",
    "dashboard": "dashboard.html",
    "drills": "drills.html",
    "foundation": "foundation.html",
    "drills-library": "drills-library.html",
    "tips": "tips.html",
    "about": "about.html",
    "get-started": "get-started.html",
    "customize": "customize.html",
    "signup": "signup.html",
    "login": "login.html",
    "ai-coach": "ai-coach.html",
    "tactical-coach": "tactical-coach.html",
    "team": "team.html",
}

TEMPLATE_OUTPUTS = {
    "programs-page.html": "programs.html",
    "dashboard.html": "dashboard.html",
    "drills-page.html": "drills.html",
    "foundation.html": "foundation.html",
    "drills-library-page.html": "drills-library.html",
    "tips-page.html": "tips.html",
    "about-page.html": "about.html",
    "get-started-page.html": "get-started.html",
    "customize.html": "customize.html",
    "signup-page.html": "signup.html",
    "login-page.html": "login.html",
    "ai-coach.html": "ai-coach.html",
    "tactical-coach.html": "tactical-coach.html",
    "team-hub.html": "team.html",
}


def static_url(filename: str) -> str:
    return "static/" + filename.strip()


def route_url(endpoint: str, **kwargs: str) -> str:
    if endpoint == "home":
        return "index.html"
    if endpoint == "drill_detail":
        return f"drill-{kwargs['slug']}.html"
    return ROUTES.get(endpoint, endpoint)


def replace_flask_expressions(source: str) -> str:
    source = re.sub(
        r"\{\{\s*url_for\(\s*'static'\s*,\s*filename\s*=\s*'([^']+)'\s*\)\s*\}\}",
        lambda match: static_url(match.group(1)),
        source,
    )
    source = re.sub(
        r"\{\{\s*url_for\(\s*'static'\s*,\s*filename\s*=\s*'([^']+)'\s*\)\s*\}\}",
        lambda match: static_url(match.group(1)),
        source,
    )
    source = re.sub(
        r"\{\{\s*url_for\(\s*'([a-z-]+)'(?:\s*,[^}]*)?\s*\)\s*\}\}",
        lambda match: route_url(match.group(1)),
        source,
    )

    for route, filename in ROUTES.items():
        source = source.replace(f'"/{route}"', f'"{filename}"')
        source = source.replace(f"'/{route}'", f"'{filename}'")

    source = source.replace('href="/"', 'href="index.html"')

    source = re.sub(
        r"([\"'])/drills/([a-z0-9-]+)([\"'])",
        lambda match: f"{match.group(1)}drill-{match.group(2)}.html{match.group(3)}",
        source,
    )
    source = source.replace('href="/drills/${slug}"', 'href="drill-${slug}.html"')
    return source


def read_drills() -> dict:
    tree = ast.parse((ROOT / "app.py").read_text())
    for node in tree.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id == "DRILLS":
                    return ast.literal_eval(node.value)
    raise RuntimeError("DRILLS was not found in app.py")


def render_drill_detail(slug: str, drill: dict) -> str:
    source = (TEMPLATES / "drill-detail.html").read_text()
    values = {
        "drill.name": drill["name"],
        "drill.category": drill["category"],
        "drill.difficulty": drill["difficulty"],
        "drill.summary": drill["summary"],
        "drill.duration": drill["duration"],
        "drill.xp": drill["xp"],
        "drill.video_query": drill["video_query"],
        "slug": slug,
        "drill.equipment": drill["equipment"],
        "drill.focus": drill["focus"],
    }
    for expression, value in values.items():
        source = re.sub(r"\{\{\s*" + re.escape(expression) + r"\s*\}\}", html.escape(str(value)), source)
    source = source.replace("{{ drill.xp|replace('+', '')|replace(' XP', '') }}", drill["xp"].replace("+", "").replace(" XP", ""))
    source = source.replace("{{ drill.duration|replace(' min', '') }}", drill["duration"].replace(" min", ""))
    source = source.replace("{{ drill.video_query | replace(' ', '+') | urlencode }}", quote_plus(drill["video_query"]))
    source = re.sub(r"\{% for step in drill\.steps %\}.*?\{% endfor %\}", "".join(f'<div class="step">{html.escape(item)}</div>' for item in drill["steps"]), source, flags=re.S)
    source = re.sub(r"\{% for point in drill\.points %\}.*?\{% endfor %\}", "".join(f"<li>{html.escape(item)}</li>" for item in drill["points"]), source, flags=re.S)
    source = re.sub(r"\{% for mistake in drill\.mistakes %\}.*?\{% endfor %\}", "".join(f"<li>{html.escape(item)}</li>" for item in drill["mistakes"]), source, flags=re.S)
    return replace_flask_expressions(source)


def build() -> None:
    for template_name, output_name in TEMPLATE_OUTPUTS.items():
        source = (TEMPLATES / template_name).read_text()
        (ROOT / output_name).write_text(replace_flask_expressions(source))

    # The existing root homepage is the static landing page. It also contains
    # Flask expressions, so export it in place after rewriting those expressions.
    homepage = ROOT / "index.html"
    homepage.write_text(replace_flask_expressions(homepage.read_text()))

    for slug, drill in read_drills().items():
        (ROOT / f"drill-{slug}.html").write_text(render_drill_detail(slug, drill))


if __name__ == "__main__":
    build()
    print("Built GitHub Pages HTML files.")
