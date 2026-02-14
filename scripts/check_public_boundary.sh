#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

# Block business-sensitive language in public docs.
if rg -n -i \
  --glob '*.md' \
  --glob '!docs/PUBLIC_INTERNAL_BOUNDARY.md' \
  --glob '!BUSINESS_CASE.md' \
  '(investor|fundraising|go-to-market|\bgtm\b|pricing strategy|series a|revenue forecast|\bcac\b|\bltv\b)' \
  docs product-docs README.md >/tmp/public_boundary_hits.txt 2>/dev/null; then
  echo "Public boundary check failed. Found business-sensitive content:"
  cat /tmp/public_boundary_hits.txt
  exit 1
fi

echo "Public boundary check passed."
