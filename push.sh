#!/bin/bash
# Usage: sh push.sh "Commit title here"
# (if you are using somebody elses github info, add your name in brackets at the start of your commit title)

git add .
git commit -m "$1"
git push -u origin master 