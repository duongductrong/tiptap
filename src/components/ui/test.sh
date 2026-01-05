#!/bin/bash

# Iterate over files in the current directory
for fullfile in *; do
  # Check if it's a regular file and has an extension (contains a '.')
  if [[ -f "$fullfile" && "$fullfile" == *.* ]]; then
    # Use parameter expansion to remove the extension part
    filename="${fullfile%.*}"
    echo "$filename"
  fi
done