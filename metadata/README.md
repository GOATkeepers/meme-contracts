# Metadata Scripts

The upload script uploads files from a local directory, and saves all metadata into a "manifest" file.

For example:
```
# manifest.json
{
  [tokenId]: { name: 'PFP 1', image: 'url' },
  1: { name: 'PFP 1', image 'url for 1'},
  2: { name: 'PFP 2', image 'url for 2'},
}
```
The metadata API lambda just uses this simple manifest to serve up metadata for a tokenId.
The lambda should check contract to make sure someone actually owns item, so not leaking 
unpurchased items.

### Prereqs
To run upload script, you'll need a Access token to the Chainsafe IPFS upload API

Run:
`CHAINSAFE_ACCESS_TOKEN=abc node upload-images-to-ipfs.js`

Because this takes a long time for a drop with 1000s of images, it will save checkpoint files in cache/
These are a checkpoint so we don't have to restart uploads from beginning and possibly crash again.
i.e.
cache/cache250.json
  /cache500.json etc.
  