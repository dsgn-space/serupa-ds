#!/bin/bash
# Runs once on first boot (passed as user data by up.sh). Installs Docker and __CONCURRENT__ GitHub Actions
# runners for github.com/dsgn-space/serupa-ds (labels self-hosted, linux, x86), and an idle watchdog that deletes
# this server after IDLE_HOURS with no job running here and none queued for the repository (0: no watchdog). The idle
# clock starts again at every boot, so a restarted server isn't deleted at once.
set -euo pipefail
REPO_URL="https://github.com/dsgn-space/serupa-ds"
REG_TOKEN="__RUNNER_TOKEN__"           # registration token from Settings > Actions > Runners (lasts an hour)
CONCURRENT="__CONCURRENT__"
IDLE_HOURS="__IDLE_HOURS__"
IBM_API_KEY="__IBM_API_KEY__"
SERVER_NAME="__SERVER_NAME__"
REGION="__REGION__"

export DEBIAN_FRONTEND=noninteractive
cat > /etc/sysctl.d/90-ci-inotify.conf <<'SYS'
fs.inotify.max_user_instances=8192
fs.inotify.max_user_watches=1048576
SYS
sysctl --system
apt-get update -y
apt-get install -y ca-certificates curl jq mdadm

# Ubuntu's daily unattended upgrade (apt-daily-upgrade.timer, 06:00 plus up to an hour) hands its packages to
# needrestart, which on Ubuntu 24.04 restarts every service using an upgraded library, the 28 runner services too.
# On 21 November at 06:54:13 UTC, inside that window, all of them received a shutdown signal at once while the VM
# stayed up: every running job failed, and the jobs assigned that second lost their runner. Security updates still
# install; needrestart only lists what would need a restart, and the next boot takes them in.
mkdir -p /etc/needrestart/conf.d
echo "\$nrconf{restart} = 'l';" > /etc/needrestart/conf.d/90-burst-no-restart.conf

# Docker and every job's workspace go on the local NVMe disks (the boot volume is far too slow for many jobs). Those
# disks are instance storage: IBM wipes them on every stop, so /data is built again at each boot by burst-data, a
# systemd unit that runs before Docker. The runners themselves (binaries and registration) live on the boot volume
# in /opt/runner, which survives a stop, so a restarted server comes back with its runners and needs no new token.
cat > /usr/local/bin/burst-data.sh <<'DATA'
#!/bin/bash
set -euo pipefail
mountpoint -q /data && { mountpoint -q /var/lib/docker || mount --bind /data/docker /var/lib/docker; exit 0; }
BOOT_DISK=$(lsblk -no PKNAME "$(findmnt -no SOURCE /)" | head -1)
DATA_DISKS=$(lsblk -dpno NAME,TYPE,SIZE -b | awk -v boot="/dev/$BOOT_DISK" '$2=="disk" && $1!=boot && $3>500000000000 {print $1}')
N=$(echo "$DATA_DISKS" | grep -c . || true)
DEV=""
if [ "$N" -ge 2 ]; then
  mdadm --stop /dev/md0 2>/dev/null || true
  mdadm --create /dev/md0 --run --level=0 --raid-devices="$N" $DATA_DISKS; DEV=/dev/md0
elif [ "$N" -eq 1 ]; then DEV=$DATA_DISKS; fi
mkdir -p /data
if [ -n "$DEV" ]; then mkfs.ext4 -F -E nodiscard -m 0 "$DEV"; mount -o noatime "$DEV" /data; fi
mkdir -p /data/docker /data/work /var/lib/docker
id runner >/dev/null 2>&1 && chown runner /data/work
mount --bind /data/docker /var/lib/docker
DATA
chmod 755 /usr/local/bin/burst-data.sh
cat > /etc/systemd/system/burst-data.service <<'UNIT'
[Unit]
Description=Build /data on the instance disks (wiped on every stop)
DefaultDependencies=no
After=local-fs.target
Before=docker.service containerd.service
[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/local/bin/burst-data.sh
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable burst-data.service
systemctl start burst-data.service
curl -fsSL https://get.docker.com | sh

id runner >/dev/null 2>&1 || useradd -m -G docker runner
chown runner /data/work
V=$(curl -fsSL https://api.github.com/repos/actions/runner/releases/latest | jq -r .tag_name | tr -d v)
mkdir -p /opt/runner
curl -fsSL -o /opt/runner/runner.tar.gz "https://github.com/actions/runner/releases/download/v$V/actions-runner-linux-x64-$V.tar.gz"
for i in $(seq 1 "$CONCURRENT"); do
  d=/opt/runner/slot$i; mkdir -p "$d" /data/work/slot$i; tar xzf /opt/runner/runner.tar.gz -C "$d"; chown -R runner "$d" /data/work/slot$i
  (cd "$d" && sudo -u runner ./config.sh --unattended --url "$REPO_URL" --token "$REG_TOKEN" \
     --name "ibm-burst-$i" --labels x86 --work /data/work/slot$i --replace && ./svc.sh install runner && ./svc.sh start)
  # Each runner waits for /data, and makes its own work folder again after a stop wiped it.
  u=$(cat "$d/.service"); mkdir -p "/etc/systemd/system/$u.d"
  printf '[Unit]\nRequires=burst-data.service\nAfter=burst-data.service docker.service\n[Service]\nExecStartPre=+/bin/sh -c "mkdir -p /data/work/slot%s && chown runner /data/work/slot%s"\n' "$i" "$i" > "/etc/systemd/system/$u.d/data.conf"
done
systemctl daemon-reload
echo '0 * * * * root docker system prune -af --filter until=24h' > /etc/cron.d/docker-prune

# Watchdog: a job is running while any Runner.Worker process is alive.
curl -fsSL https://clis.cloud.ibm.com/install/linux | sh
ibmcloud plugin install vpc-infrastructure -f
cat > /usr/local/bin/idle-watchdog.sh <<WD
#!/bin/bash
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
exec >>/var/log/idle-watchdog.log 2>&1
STAMP=/var/lib/idle-watchdog.last-busy
[ -f \$STAMP ] || date +%s > \$STAMP
BUSY=0; pgrep -f Runner.Worker >/dev/null && BUSY=1
# Jobs queued for the repository count as busy too: never delete the machine they are waiting for. The repository
# is public, so this needs no token (6 calls an hour, well under the 60 GitHub allows without one). If GitHub
# doesn't answer, count it as busy.
# Only runs queued in the last 6 hours: on 20 Nov, 16 runs from 11 Nov still showed as queued and never would start,
# and counting them kept the machine busy for ever.
Q=\$(curl -fsS --max-time 20 "https://api.github.com/repos/dsgn-space/serupa-ds/actions/runs?status=queued&per_page=100" | jq -r '[.workflow_runs[] | select((.created_at | fromdate) > now - 21600)] | length' 2>/dev/null)
case "\$Q" in ''|null|*[!0-9]*) BUSY=1 ;; 0) ;; *) BUSY=1 ;; esac
[ \$BUSY -eq 1 ] && date +%s > \$STAMP
IDLE=\$(( \$(date +%s) - \$(cat \$STAMP) ))
if [ \$BUSY -eq 0 ] && [ \$IDLE -ge $(( IDLE_HOURS * 3600 )) ]; then
  date
  ibmcloud login --apikey "$IBM_API_KEY" -r "$REGION" -q && ibmcloud is instance-delete "$SERVER_NAME" -f && exit 0
  # Keep running: a server powered off here still holds its name and its disk, and its runners only show Offline
  # (21 November: the key was rotated, the delete failed, and the stopped VM blocked up.sh). It tries again in 10
  # minutes; the log says why it can't.
  echo "delete failed; still running"
fi
WD
chmod 700 /usr/local/bin/idle-watchdog.sh
if [ "$IDLE_HOURS" -gt 0 ]; then
  printf '%s\n' "@reboot root date +\\%s > /var/lib/idle-watchdog.last-busy" "*/10 * * * * root /usr/local/bin/idle-watchdog.sh" > /etc/cron.d/idle-watchdog
fi
