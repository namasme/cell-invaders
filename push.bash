cd tmp
rm -f log
touch log
git add cells.txt
git status >> log
git \
    -c user.name="cell-invaders" -c user.email="$GITHUB_EMAIL" \
    commit -m "Commit for $(date '+%m/%d/%Y')" \
    --author="Cell Invaders <$GITHUB_EMAIL>"
git status >> log
git push $1 master
