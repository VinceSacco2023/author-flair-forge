#!/usr/bin/env python3
"""Makes the claude.ai Artifact copy of public/survey.html.

The Artifact viewer wraps published content in its own document skeleton, so
the standalone file's <!doctype>, <html>, <head> and <body> tags are stripped
and everything else — title, fonts, styles, markup, script — is kept as is.
There is one survey; this is only a different envelope for it.

    python3 scripts/build-artifact-page.py out.html
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source = open(os.path.join(ROOT, "public", "survey.html"), encoding="utf-8").read()

head = re.search(r"<head>(.*?)</head>", source, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", source, re.S).group(1)

# Drop the tags the viewer supplies itself; keep the title, fonts and styles.
for pattern in (r"<meta[^>]*>\s*", r'<link rel="icon"[^>]*>\s*'):
    head = re.sub(pattern, "", head)

out = (head.strip() + "\n" + body.strip() + "\n")
target = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "artifact-survey.html")
open(target, "w", encoding="utf-8").write(out)
print("wrote", target, len(out), "bytes")
