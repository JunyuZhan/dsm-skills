#!/bin/bash

# Fix for mkdocs-rss-plugin IndexError in CI environments (like Cloudflare Pages)
# This error occurs when the plugin tries to access git history in a shallow clone.
# We attempt to fetch the full history to ensure git log works correctly.

if [ -d .git ] && [ -f .git/shallow ]; then
    echo "Detected shallow clone. Fetching full git history for plugins..."
    git fetch --unshallow || echo "Warning: Failed to fetch full history. Some plugins might fail."
fi

# Run the build
mkdocs build
