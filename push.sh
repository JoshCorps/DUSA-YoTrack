#!/bin/bash
# Usage: sh push.sh "Commit title here"

git add .
git commit -m "$1"
git push -u origin master 