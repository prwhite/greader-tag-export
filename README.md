# greader-tag-export

Exports non-public entries for tags or Google Reader states (e.g., 'starred') as atom feeds.

## Setup:
`make`
 (will download node module dependencies)

## Usage:
usage: `reader-download-login.js <user> <pass> <xml|json> <tag>`<br>
 common tags:<br>
`  user/-/label/something`<br>
`  user/-/state/com.google/starred`<br>

## Output:
Google only allows downloading 1000 entries in each request, so this script will loop until all entries for a tag are downloaded.  Each 1000 entries will be saved in a separate numbered file.
