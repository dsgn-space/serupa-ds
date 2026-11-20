#!/bin/bash
# Delete the burst runner now (its boot volume is deleted with it).
set -euo pipefail
NAME="${NAME:-serupa-burst-github}"
ibmcloud is instance-delete "$NAME" -f
echo "Deleted. The next ./up.sh registers the runners again under the same names."
