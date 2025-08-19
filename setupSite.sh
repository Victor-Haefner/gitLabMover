sudo touch page/config.json
sudo chown www-data:www-data page/config.json
sudo chmod 664 page/config.json

SUDOERS_FILE="/etc/sudoers.d/gitlab-rake"
RULE="www-data ALL=(gitlab) NOPASSWD: /usr/bin/gitlab-rake"

if [ -f "$SUDOERS_FILE" ]; then
    echo "Sudoers file $SUDOERS_FILE already exists. Skipping."
else
    echo "Creating sudoers file for gitlab-rake..."
    echo "$RULE" | sudo tee "$SUDOERS_FILE" > /dev/null
    sudo chmod 440 "$SUDOERS_FILE"
fi
