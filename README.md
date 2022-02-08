# Hardhat

## Prereqs:
- Node 12.20+
- yarn install
- yarn chain

## Testing:
Send test transaction to local wallet that will test the contract:
`npx hardhat --network localhost send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --to 0xMyaddress --amount 2`

### local deploy:
`npx hardhat run --network localhost scripts/deploy_with_upgrades.js`

### Rinkeby add secret key: 
`TEST_ACCOUNT_SECRET_KEY=abc npx hardhat run --network rinkeby scripts/deploy_with_upgrades.js`

### Contract ops:
Log into console
`npx hardhat --network localhost console`

Unpause contract to go live
```
var a = await (await ethers.getContractFactory('MemeVIP'))
.attach('0xc366ce1744f7952dF21A84842d750b105F7c4aC7')
// ^ use contract address for "attach"

await a.unpause()
```


