#!/bin/bash
# Usage: sh push.sh "youremail@here" "Commit title here"
# (if you are using somebody elses github info, add your name in brackets at the start of your commit title)
git config user.email "$1"
git add .
git commit -m "$2"
git push -u origin master 