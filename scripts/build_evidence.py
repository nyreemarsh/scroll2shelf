"""Package what the TikTok research observed into one file the app can read.

    python3 scripts/build_evidence.py

Reads  ../research/output/summary.json, trends_app.json, rounds_review.csv
Writes src/data/evidence.json

The engine uses `courseParticipation` to decide how often each course is played,
and the results screen compares simulated output with `observedRounds`.
Re-run after the research outputs change.
"""

import csv
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RESEARCH = ROOT.parent / "research" / "output"
OUT = ROOT / "src" / "data" / "evidence.json"

# The research codes snack and extra rounds separately; the app has one wildcard course.
WILDCARD_CODES = {"extra", "snack"}


def app_course(code):
    return "wildcard" if code in WILDCARD_CODES else code


def total(posts, field):
    values = [p[field] for p in posts if isinstance(p.get(field), (int, float))]
    return {"sum": sum(values), "postsWithData": len(values)}


def main():
    summary = json.loads((RESEARCH / "summary.json").read_text())
    posts = json.loads((RESEARCH / "trends_app.json").read_text())
    with (RESEARCH / "rounds_review.csv").open() as f:
        rounds = list(csv.DictReader(f))

    shares = summary["courseShareOfPosts"]
    participation = {
        course: shares.get(course, 0)
        for course in ["starter", "main", "side", "dessert", "drink"]
    }
    participation["wildcard"] = summary["wildcardShare_p0"]

    journeys = Counter(
        " > ".join(app_course(c) for c in p["journey"]) for p in posts if p.get("journey")
    )
    months = Counter(p["postedAt"][:7] for p in posts if p.get("postedAt"))

    observed_rounds = [
        {
            "post": r["post_id"],
            "round": int(r["round"]),
            "course": app_course(r["course"]),
            "winner": r["winner"] or None,
            "decision": r["decision"],
            "productId": r["product_id"] or None,
            "name": r["matched_name"] or r["item_as_seen"],
            "priceSeen": float(r["price_seen"]) if r["price_seen"] else None,
            "confidence": float(r["confidence"]) if r["confidence"] else None,
            "checked": r["checked"] == "True" or r["checked"] == "1",
        }
        for r in rounds
        if r["course"] != "pay"
    ]

    evidence = {
        "source": "Hand-collected TikTok sample, research/output (see research/scripts)",
        "posts": summary["posts"],
        "videos": summary["videos"],
        "carousels": summary["carousels"],
        "decidingRounds": summary["decidingRounds"],
        "roundsPerPost": summary["roundsPerPost"],
        "postedRange": summary["postedRange"],
        "postsByMonth": dict(sorted(months.items())),
        "engagement": {
            "views": total(posts, "views"),
            "likes": total(posts, "likes"),
            "comments": total(posts, "commentsCount"),
            "saves": total(posts, "saves"),
            "shares": total(posts, "shares"),
        },
        # Share of posts that played each course. Drives how often the engine plays it.
        "courseParticipation": participation,
        "startsWithStarter": summary["startsWithStarter"],
        "topJourneys": [{"journey": j, "posts": n} for j, n in journeys.most_common(6)],
        "lopsidedShare": summary["lopsidedShare"],
        "lopsidedSample": summary["lopsidedSample"],
        "jointDecisions": summary["jointOrGivenChoice"],
        "dealsSeen": sorted({d for p in posts for d in p.get("deals", [])}),
        "postsUsingDeals": sum(1 for p in posts if p.get("deals")),
        "basketTotalsSeen": summary["basketTotalsSeen"],
        "observedRounds": observed_rounds,
    }
    OUT.write_text(json.dumps(evidence, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {OUT.relative_to(ROOT)}: {len(observed_rounds)} observed picks, "
          f"participation {participation}")


if __name__ == "__main__":
    main()
