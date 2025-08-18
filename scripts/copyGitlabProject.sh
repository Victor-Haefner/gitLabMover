#!/bin/bash

# Import config.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "config.sh not found! Please create it before running this script."
  exit 1
fi





#GITLAB_INFO=$(curl -s --header "PRIVATE-TOKEN: $NEW_TOKEN" "$NEW_GITLAB/api/v4/features")
#echo $GITLAB_INFO
#exit 0




# Step 1: Get group ID from old GitLab
echo "Fetching project ID for '$PROJECT_PATH/$PROJECT_NAME'..."
PROJECT_INFO=$(curl -s --header "PRIVATE-TOKEN: $OLD_TOKEN" "$OLD_GITLAB/api/v4/projects?search=$PROJECT_NAME")
PROJECT_ID=$(echo "$PROJECT_INFO" | jq ".[0].id")

if [ -z "$PROJECT_ID" ]; then
  echo "Project '$PROJECT_NAME' not found."
  exit 1
fi

echo "Found project ID: $PROJECT_ID"

export_project () {
	echo "Requesting project export..."
	curl -s -X POST --header "PRIVATE-TOKEN: $OLD_TOKEN" "$OLD_GITLAB/api/v4/projects/$PROJECT_ID/export"

	# Step 3: Wait for export to finish
	echo "Waiting for export to finish..."
	echo "status:"
	while true; do
	  STATUS=$(curl -s --header "PRIVATE-TOKEN: $OLD_TOKEN" "$OLD_GITLAB/api/v4/projects/$PROJECT_ID/export" | jq -r '.export_status')
	  if [ "$STATUS" == "finished" ]; then
	    echo "Export finished."
	    break
	  fi
	  DATE=$(date)
	  echo -e "\e[1A\e[K status: $STATUS --- $DATE"
	  sleep 5
	done
}

download_project () {
	echo "Downloading export archive..."
	STATUS=$(curl -s --header "PRIVATE-TOKEN: $OLD_TOKEN" --output "$PROJECT_NAME.tar.gz" "$OLD_GITLAB/api/v4/projects/$PROJECT_ID/export/download")
	#STATUS=$(curl -s --header "PRIVATE-TOKEN: $OLD_TOKEN" --remote-header-name --remote-name "$OLD_GITLAB/api/v4/projects/$PROJECT_ID/export/download")
	echo $STATUS
	if [ ! -f "$PROJECT_NAME.tar.gz" ]; then
	  echo "Failed to download export file."
	  exit 1
	fi
}

upload_project () {
	FILE="$UPLOAD_DIR/$PROJECT_NAME.tar.gz"

	echo "Importing project to new GitLab..."
	echo " file: $FILE"
	
	STATUS=$(curl -s -w "\n%{http_code}" -X POST \
	  --header "PRIVATE-TOKEN: $NEW_TOKEN" \
	  --form "file=@$FILE" \
	  --form "path=$PROJECT_PATH/$PROJECT_NAME" \
	  --form "name=$PROJECT_NAME" \
	  "$NEW_GITLAB/api/v4/projects/import")

	echo "Import triggered. Check progress on the new GitLab instance."
	echo $STATUS
}


#export_project
#download_project
upload_project

# Optional: Delete old project projects (manual confirmation)
echo "If you want to list and delete projects in '$PROJECT_NAME' project on the old GitLab, run:"
echo "curl --header \"PRIVATE-TOKEN: $OLD_TOKEN\" \"$OLD_GITLAB/api/v4/projects/$PROJECT_ID/projects\" | jq '.[] | {id, name}'"
#echo "Then delete with:"
#echo "curl -X DELETE --header \"PRIVATE

