#!/bin/bash
# Create the burst runner. Run on your Mac after `ibmcloud login` (see README).
set -euo pipefail
: "${RUNNER_TOKEN:?set RUNNER_TOKEN (registration token from GitHub > Settings > Actions > Runners > New self-hosted runner)}"
: "${WATCHDOG_API_KEY:?set WATCHDOG_API_KEY (IBM API key for the idle watchdog)}"
NAME="${NAME:-serupa-burst-github}"
REGION="${REGION:-jp-osa}"           # Osaka: BUYOSA gives 70% off here
ZONE="${ZONE:-${REGION}-1}"
PROFILE="${PROFILE:-bx3d-128x640}"    # Gen3 balanced, 128 vCPU / 640 GB; covered by BUYOSA and VPC1000
CONCURRENT="${CONCURRENT:-28}"  # 28 x 4 vCPU = 112, leaves 16 vCPU for Docker, the runner and the OS
IDLE_HOURS="${IDLE_HOURS:-24}"  # with nothing running here and nothing queued for the repository; 0: never
KEY="${KEY:-diki-mac}"
VPC="${VPC:-serupa-ci}"

ibmcloud target -r "$REGION" -q
SUBNET="${SUBNET:-$(ibmcloud is subnets --vpc "$VPC" --output json | jq -r --arg z "$ZONE" '[.[] | select(.zone.name==$z)][0].id')}"
[ -n "$SUBNET" ] && [ "$SUBNET" != null ] || { echo "No subnet in $ZONE for VPC $VPC"; exit 1; }
IMAGE=$(ibmcloud is images --visibility public --output json \
  | jq -r '[.[] | select(.name|test("^ibm-ubuntu-24-04.*amd64")) | select(.status=="available")][0].id')
DIR=$(cd "$(dirname "$0")" && pwd)
USERDATA=$(mktemp)
sed -e "s|__RUNNER_TOKEN__|$RUNNER_TOKEN|" -e "s|__CONCURRENT__|$CONCURRENT|" \
    -e "s|__IDLE_HOURS__|$IDLE_HOURS|" -e "s|__IBM_API_KEY__|$WATCHDOG_API_KEY|" \
    -e "s|__SERVER_NAME__|$NAME|" -e "s|__REGION__|$REGION|" "$DIR/cloud-init.sh" > "$USERDATA"

ibmcloud is instance-create "$NAME" "$VPC" "$ZONE" "$PROFILE" "$SUBNET" \
  --image "$IMAGE" --keys "$KEY" --user-data @"$USERDATA" \
  --boot-volume '{"delete_volume_on_instance_delete":true,"volume":{"capacity":100,"profile":{"name":"general-purpose"}}}'
rm -f "$USERDATA"
echo "Creating. It boots in a few minutes; the 28 runners show as Idle on GitHub (Settings > Actions > Runners) when setup finishes (~5-10 min). Then run the Runner ping workflow once (gh workflow run runner-ping.yml -R dsgn-space/serupa-ds), so CI sends x86 jobs here again."
