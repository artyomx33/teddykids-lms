#!/bin/bash

# Load environment variables from .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "No .env file found!"
  exit 1
fi

# Run the debug script
node debug-id-mismatch.mjs
