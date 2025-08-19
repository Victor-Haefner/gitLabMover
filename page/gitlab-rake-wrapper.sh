#!/bin/bash
echo "wrap gitlabrake"
exec /usr/bin/gitlab-rake "$@"

