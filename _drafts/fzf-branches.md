---
layout:	post
title: How to delete git branches with fzf?
description: 
image: /images/1500x1000.png
tags: []
---

```bash
function delete-branches() {
  local branches_to_delete
  branches_to_delete=$(git branch | fzf --multi)

  if [ -n "$branches_to_delete" ]; then
    # Use a while loop to read each branch line by line
    while IFS= read -r branch; do
      # Trim whitespace from the branch name
      branch=$(echo "$branch" | xargs)

      # Delete the branch
      git branch --delete --force "$branch"
    done <<< "$branches_to_delete"
  fi
}
```