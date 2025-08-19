sudo touch page/config.json
sudo chown www-data:www-data page/config.json
sudo chmod 664 page/config.json

sudo chown gitlab:gitlab page/gitlab-rake-wrapper.sh
sudo chmod 4755 page/gitlab-rake-wrapper.sh
