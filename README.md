# Overview

This comes from https://www.npmjs.com/package/slack-delete-files but I was unable to find a repo for this package I could submit PRs to.

EDIT: I guess I didn't try very hard, the original is here: https://github.com/diessica/slack-delete-files

What this does beyond the original module:

* files.delete is a Tier 3 rate limited slack API, meaning only 50+ req/min are allowed. I've added bottleneck to only fire the request every 1s.
* I wanted to run this as something automatable, so I've removed `inquirer` and switched to the following env vars:
  * `SLACK_TOKEN` (required) your slack API token
  * `SLACK_KEEP_PINNED` (default true) keep pinned files
  * `SLACK_KEEP_DAYS` (default 10) only delete files older than this many days
