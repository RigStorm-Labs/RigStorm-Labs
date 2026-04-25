@echo off
REM Commit script for form validation updates

git add -A

git commit -m "Update form validation: make email and phone optional (at least one required), make budget field optional - checkout.html: Remove required attributes from email and phone fields, add validation to ensure at least one contact method is provided - build-custom.html: Remove required attributes from email, phone, and budget fields, add validation to ensure at least one contact method is provided - Both forms maintain strict validation on other required fields (name, address, etc.) Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo Changes committed successfully!
git log --oneline -1
pause
