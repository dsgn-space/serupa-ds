# The IBM burst runner: bring it back

The burst runner is one IBM Cloud VM (`serupa-burst-github`, Osaka, `bx3d-128x640`) that runs 28 GitHub Actions runners for dsgn-space/serupa-ds. They are named `ibm-burst-1` to `ibm-burst-28` and carry the labels `self-hosted, linux, x86`.

**Why a stop breaks it.** `/data` (Docker and the jobs' work folders) is a RAID 0 of the instance-storage NVMe disks (`vdb`, `vdc`). IBM wipes instance storage on every stop. On a server built before 14 November the runners also lived in `/data/runner/slotN`, so after a stop and start, `/data` is empty, Docker has nothing to run on, and every runner unit is dead. A server built with the current `cloud-init.sh` keeps the runners on the boot volume (`/opt/runner/slotN`) and rebuilds `/data` at every boot (the `burst-data` unit, which runs before Docker and the runners), so a stop and start heals itself and needs no new token. CI sends its x86 jobs to them while the repository variable `SERUPA_X86_RUNNER` is `["self-hosted","linux","x86"]`.

## After it comes back, run Runner ping

CI, Nightly, Cross-browser and Update baselines send x86 jobs to these runners only while one of them has started a job in the last 100 minutes; otherwise the jobs go to GitHub's own runners (`tools/runner-watch.mjs --pick`). The VM deletes itself after two idle hours, so a job sent to it then would wait a day. Fresh runners have started nothing, so after any bring-up below, run **Actions > Runner ping > Run workflow** once (or `gh workflow run runner-ping.yml -R dsgn-space/serupa-ds`). The next runs then use the VM.

## When CI waits for it

Jobs waiting for an x86 runner, and `ibm-burst-*` showing Offline under GitHub > Settings > Actions > Runners, mean the VM is off or gone.

1. **Unblock CI first.** Set `SERUPA_X86_RUNNER` to `"ubuntu-24.04"` (with the quotes) under Settings > Secrets and variables > Actions > Variables. New jobs then run on GitHub's own x64 runners. Jobs already waiting keep their label: cancel their run, and it starts again on GitHub's runners (a merge-queue run drops its pull request, so arm auto-merge again).
2. **Then bring the VM back**, using the steps below.
3. **Set the variable back** to `["self-hosted","linux","x86"]` once the runners show Idle.

## The VM is stopped (it still appears in IBM Cloud > VPC > Virtual server instances)

1. Start it from the console.
2. **Network.** The VM has no floating IP by default, and its security group has no SSH rule. Open the instance and reserve and attach a floating IP on its network interface. Then, in its security group, add an inbound TCP 22 rule, from your own IP if you can.
3. **SSH in as `ubuntu`, not root:** `ssh -i <the key up.sh named in KEY> ubuntu@<floating IP>`, then run `sudo -i`.
4. **Stop the old watchdog before it deletes the VM.** A server built before 14 November keeps its old "last busy" time across a reboot, so its watchdog deletes the server within 10 minutes of the boot:

   ```sh
   rm /etc/cron.d/idle-watchdog
   date +%s > /var/lib/idle-watchdog.last-busy
   ```

5. **A server built with the current scripts** has rebuilt `/data` and restarted its runners by itself. Check that they show Idle on GitHub, and you're done.
6. **A server built before 14 November** has lost `/data` and its runners with it. Recreating it (next section) is the quickest fix, because its runners are gone too and need a fresh registration token either way. If you'd rather keep the VM, rebuild by hand:

   ```sh
   mdadm --create /dev/md0 --run --level=0 --raid-devices=2 /dev/vdb /dev/vdc
   mkfs.ext4 -F -E nodiscard -m 0 /dev/md0 && mkdir -p /data && mount -o noatime /dev/md0 /data
   mkdir -p /data/docker && mount --bind /data/docker /var/lib/docker && systemctl restart docker
   ```

   Then register each runner again with a fresh token. Get the token from GitHub > Settings > Actions > Runners > New self-hosted runner; it lasts an hour. Run the `config.sh` and `svc.sh` lines from the runner loop in `cloud-init.sh` for each slot.

7. Detach the floating IP, or remove the port 22 rule, once you're done.

## The VM is gone

The watchdog deletes the VM when it finds nothing to do, and `down.sh` deletes it on purpose. To recreate it, on a Mac with `ibmcloud` logged in:

1. Get a registration token: GitHub > Settings > Actions > Runners > New self-hosted runner. It lasts an hour.
2. Run this from this folder:

   ```sh
   RUNNER_TOKEN=<token> WATCHDOG_API_KEY=<the service ID's key> ./up.sh
   ```

3. The 28 runners show Idle in about 10 minutes. `up.sh` replaces the old registrations under the same names. Then run Runner ping (above).

## The watchdog's key and who may run jobs here

Every job on this VM can read `WATCHDOG_API_KEY`: the runners' user is in the `docker` group, which is root on the VM, and the key sits in `/usr/local/bin/idle-watchdog.sh`. So the key must be able to do one thing only, and no stranger's job may run here.

- **The key belongs to the service ID `serupa-watchdog`, never to a person.** Its one access policy is platform Editor on VPC Infrastructure Services, resource type Virtual Server for VPC, in `jp-osa`: enough to delete the VM, and nothing else in the account. A person's own key can do everything that person can.
- **To make a new key:** IBM Cloud > Manage > Access (IAM) > Service IDs > `serupa-watchdog` > API keys > Create. Delete the old one there once the new VM is up.
- **Check a new key before trusting it:** `ibmcloud login --apikey <key> -r jp-osa`, then `./down.sh`. It deleted the VM on 21 November, which is what the watchdog needs. Log in as yourself again before `./up.sh`: the service ID can't create a VM.
- **Type the secrets without showing them** (zsh), so they stay out of the shell history and off the screen:

  ```sh
  read -s "RUNNER_TOKEN?Runner token: "; export RUNNER_TOKEN; echo
  read -s "WATCHDOG_API_KEY?Watchdog key: "; export WATCHDOG_API_KEY; echo
  ./up.sh
  ```

- **A fork's pull request needs a maintainer's approval before any workflow runs:** GitHub > Settings > Actions > General > "Approval for running fork pull request workflows from contributors" is "Require approval for all external contributors". The workflows send a fork's jobs to GitHub's runners, but a fork can edit the workflow file in its own pull request, so this setting is what keeps its code off this VM. Read a fork's changes to `.github/` before approving its run.

## Every job failed at once with "The runner has received a shutdown signal"

All 28 runner services were restarted while the VM stayed up, and the jobs assigned that second fail later with "The self-hosted runner lost communication with the server". On Ubuntu 24.04 the daily unattended upgrade (06:00 to 07:00 UTC) runs needrestart, which restarts every service that uses an upgraded library, the runners included. A server built with the current `cloud-init.sh` only lists those services (`/etc/needrestart/conf.d/90-burst-no-restart.conf`) and takes the updates in at its next boot. On an older server, run this once as root:

```sh
mkdir -p /etc/needrestart/conf.d && echo "\$nrconf{restart} = 'l';" > /etc/needrestart/conf.d/90-burst-no-restart.conf
```

Then re-run the failed jobs.

## The watchdog (since 14 November)

`cloud-init.sh` installs `/usr/local/bin/idle-watchdog.sh`, which cron runs every 10 minutes. It deletes the VM only when all of these are true:

- no job is running on it;
- no workflow run of the repository is queued (it asks GitHub's public API, and counts no answer as busy);
- nothing has run here for `IDLE_HOURS` (2 by default since 16 November; it was 4, and 1 before 14 November).

There is no cap on uptime: the 72-hour `MAX_HOURS` limit was removed on 16 November. GitHub's 6-hour job timeout ends a stuck job, and the idle clock then runs.

The idle clock starts again at every boot (`@reboot` in `/etc/cron.d/idle-watchdog`), so a restarted VM is never deleted at once. These changes, and the `/data` rebuild at boot, apply to a VM created with the updated `up.sh`. For an older VM, follow steps 4 and 6 above, or recreate it.

## The VM running on 16 November

The `serupa-burst-github` VM running on 16 November (floating IP 163.68.81.211) is an older build, created before 14 November. Its watchdog wasn't running at all, because `/etc/cron.d/idle-watchdog` was missing.

Diki fixed it by hand on 16 November:

- set the idle limit to 2 hours (`-ge 7200`) in `/usr/local/bin/idle-watchdog.sh`;
- reset `/var/lib/idle-watchdog.last-busy`;
- recreated the cron entry, every 10 minutes, logging to `/var/log/idle-watchdog.log`.

Because it is an older build, two things still behave the old way:

- **A stop or a reboot loses `/data` and its runners.** Recreate the VM with `up.sh` rather than restarting it.
- **Nothing resets the idle clock at boot.** If it is ever rebooted, run `date +%s > /var/lib/idle-watchdog.last-busy` first, or it deletes itself within 10 minutes.

The next VM made with `up.sh` gets all of this from `cloud-init.sh`, with a 2-hour idle limit.

**It stopped, it wasn't deleted (found 20 November).** The watchdog tries `ibmcloud is instance-delete` and, when that fails, powers the VM off (`shutdown -h now`). On this build the delete failed, so the VM sat stopped from about 18 November, with its boot volume and floating IP `serupa-burst-ip` still billing and its runners lost with `/data`. Don't start it: recreate it.

```sh
ibmcloud is instance-delete serupa-burst-github -f
RUNNER_TOKEN=<token> WATCHDOG_API_KEY=<the service ID's key> ./up.sh
```

Then run Runner ping. `up.sh` makes no floating IP; release `serupa-burst-ip` (`ibmcloud is floating-ip-release serupa-burst-ip -f`) unless you want SSH. Keep the public gateway: the new VM reaches GitHub through it. If a new VM is ever found stopped instead of gone, its `WATCHDOG_API_KEY` can't delete: check `/var/log/idle-watchdog.log`.
