#!/usr/bin/env bash
# Pre-commit gates: naming blocklist and dash rules.
# Scans tracked source and docs, never node_modules or build output.
set -u

FILES=$(git ls-files 2>/dev/null | grep -vE '^(public/.*\.(png|jpg|ico))$' || true)
if [ -z "$FILES" ]; then
  FILES=$(find src tools public README.md next.config.ts package.json -type f 2>/dev/null)
fi

fail=0

# Terms that must never appear in this repo, case insensitive.
# Short or collision-prone terms are word bounded.
BLOCK='nucompass|signity|reloaction|envisify|spendly|rithik|guleria|tefileno|datawarehouse|\bncm\b|\brac\b|\bcpc\b|\bcpe\b|\bachin\b|\beric\b|\bdota\b|great plains|\babbe\b|\bglc2\b|\bkais\b|\bintz\b|\babin\b|\bbpxx\b|\bhewa\b|\bunai\b|\bdaiy\b|\bcath\b|\bdaim\b|\btxue\b|\bonco\b|\bkphc\b|\bfrcr\b|\blenz\b|\bmerz\b'
hits=$(echo "$FILES" | xargs grep -rinIE "$BLOCK" 2>/dev/null | grep -vE 'tools/check.sh|deck/lint_deck.py')
if [ -n "$hits" ]; then
  echo "BLOCKLIST HITS:"
  echo "$hits"
  fail=1
fi

# Banned words in copy, comments, URLs and metadata.
WORDS='\bdemo\b|\bdemos\b|demonstration|walkthrough|simulated'
whits=$(echo "$FILES" | xargs grep -rinIE "$WORDS" 2>/dev/null | grep -vE 'tools/check.sh|deck/lint_deck.py')
if [ -n "$whits" ]; then
  echo "BANNED WORD HITS:"
  echo "$whits"
  fail=1
fi

# Em and en dashes are not allowed anywhere; plain hyphens only.
dhits=$(echo "$FILES" | xargs grep -rinIP '\x{2013}|\x{2014}' 2>/dev/null | grep -vE 'tools/check.sh|deck/lint_deck.py')
if [ -n "$dhits" ]; then
  echo "DASH HITS:"
  echo "$dhits"
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "CHECKS PASS"
fi
exit $fail
