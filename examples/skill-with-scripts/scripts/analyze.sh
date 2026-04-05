#!/bin/bash
# Example analysis script
echo "Analyzing current directory..."
find . -name "SKILL.md" -type f | while read -r file; do
  echo "Found skill: $file"
done
echo "Analysis complete."
