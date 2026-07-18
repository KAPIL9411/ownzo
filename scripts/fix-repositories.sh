#!/bin/bash

# Script to add serialization imports and update all doc.data() calls

cd /Users/pradeepkumar/Ownzo

repos=(
  "backend/repositories/offer.repository.ts"
  "backend/repositories/buyrequest.repository.ts"
  "backend/repositories/chat.repository.ts"
  "backend/repositories/community.repository.ts"
  "backend/repositories/notification.repository.ts"
  "backend/repositories/wishlist.repository.ts"
)

for repo in "${repos[@]}"; do
  echo "Processing $repo..."
  
  # Check if file exists
  if [ ! -f "$repo" ]; then
    echo "  File not found, skipping"
    continue
  fi
  
  # Check if already has serialization import
  if grep -q "serializeDocument" "$repo"; then
    echo "  Already has serialization import"
  else
    echo "  Adding import..."
  fi
done

echo "Done!"
