const fs = require('fs')
const assert = require('assert')
const superagent = require('superagent')


/**
 * 1. Randomize the order of IDs. 1 - 8989. 
 *    i.e. [1 2 3 .... 8989]
 *    These array index are new tokenIds. (+1 = start with 1 not zero)
 * 2. Upload image to IPFS using chainsafe API
 * 3. Generate meatdata:
 *    1 Take the images IPFS CID and put in metadata file
 *    2 Make sure the name of the token in metadata is right (New tokenId)
 *    3 make sure to grab the attributes in the metadata
 * 
 * 4. Save all meatdata in one manifest file to upload to the lambda
 */

const CHAINSAFE_BUCKET_ID='a97dafc8-7ec0-4249-bb48-2b990606d9f4'
const imgDir = '/Users/gabrielibarra/Documents/pfp/images'
const metaDir = '/Users/gabrielibarra/Documents/pfp/json'

async function main() {
  // in case uploading stops - want to pick up where we left off.
  let cache = {};
  try {
    const exists = fs.readFileSync('cache.json')
    if (exists) {
      cache = JSON.parse(exists)
    }
  } catch (err) {

  }

  const allJson = {}

  if (Object.values(cache).length < 355) {
    console.log('Still need to process', 355 - Object.values(cache).length)
  }

  for (let index=0; index < 355; index++) {
    if (index % 50 === 0) {
      console.log('index', index)
      fs.writeFileSync(`cache/cache-${index}.json`, JSON.stringify(allJson));
    }
    // if (index > 10) break;
    const newTokenId = index + 1;
    if (cache[newTokenId]) {
      allJson[newTokenId] = cache[newTokenId]
      continue
    }

    const oldJson = JSON.parse(fs.readFileSync(`${metaDir}/${newTokenId}.json`))
    
    try {
      // Open files with the old ID
      const img = fs.readFileSync(`${imgDir}/${newTokenId}.png`)

      // Upload img to IPFS
      const imageUri = await uploadFile(`${newTokenId}.png`, img, 'image')

      const finalJson = {
        ...oldJson,
        image: imageUri,
      }
      allJson[newTokenId] = finalJson;
      await sleep();
    } catch (err) {
      console.log(`Error on file ${newTokenId}.png`)
      console.error(err)
      break;
    }
  }

  fs.writeFileSync('cache.json', JSON.stringify(allJson));

  fs.writeFileSync('metadata_all.json', JSON.stringify(allJson));
}

async function sleep() {
  return new Promise((resolve) => {
    setTimeout(function() {
      resolve(true)
    }, 100)
  })
}

async function uploadFile(filename, buffer, prefix) {
  const path = prefix ? `/${prefix}` : ''
  const uploadRes = await superagent.post(`https://api.chainsafe.io/api/v1/bucket/${CHAINSAFE_BUCKET_ID}/upload`)
    .set('Authorization', `Bearer ${process.env.CHAINSAFE_ACCESS_TOKEN}`)
    .attach('file', buffer, filename)
    .field('path', path || '/')

  // API doesnt return filename! Have to get it:
  const infoRes = await postRequest(`bucket/${CHAINSAFE_BUCKET_ID}/file`, {
    path: `${path}/${filename}`
  });
  /**
   * res.body = {
  content: {
    name: 'item.png',
    cid: 'QmQYQCAFPLES8SUmw9KrrGd4T7daq4HWe38MYnX4Un4BBr',
    content_type: 'application/octet-stream',
    size: 45838,
    version: 0,
    created_at: 0
  },
  persistent: null,
  messages: null
}
   */
  const ipfsHashId = infoRes.body.content.cid;
  return `https://ipfs.chainsafe.io/ipfs/${ipfsHashId}`
}

    
async function postRequest(url, data) {
  return superagent.post(`https://api.chainsafe.io/api/v1/${url}`)
    .send(data)
    .set('Authorization', `Bearer ${process.env.CHAINSAFE_ACCESS_TOKEN}`)

}

// First time this runs, save a file of randomized IDs, in case
// uploads fail and I need to resatart from where left off.
function randomizeIdList() {
  try {
    const exists = fs.readFileSync('randomized.json')
    if (exists) {
      return JSON.parse(exists)
    }
  } catch (err) {
    
  }
  const ids = []
  for (let i=1; i<= 8989; i++) {
    ids.push(i);
  }
  console.log(ids)

  // shuffle:
  let currentIndex = ids.length,  randomIndex;
  const array = [...ids]
  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  console.log(array);
  // Verify all unique numbers:
  const sett = new Set(array)
  assert(Array.from(sett).length === 8989);

  fs.writeFileSync('randomized.json', JSON.stringify(array))

  return array;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
  
}
