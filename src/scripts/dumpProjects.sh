#!/bin/bash

INPUT_DIR="src/resources/projects"
OUTPUT_FILE="dump.md"

# Clear output file
> "$OUTPUT_FILE"

# Loop through all JSON files
for file in "$INPUT_DIR"/*.json; do
  # Extract title and markdown
  title=$(jq -r '.title' "$file")
  markdown=$(jq -r '.markdown' "$file")

  # Write to dump.md
  {
    echo "# $title"
    echo ""
    echo "$markdown"
    echo ""
    echo ""
  } >> "$OUTPUT_FILE"

done

echo "Dump generated in $OUTPUT_FILE"