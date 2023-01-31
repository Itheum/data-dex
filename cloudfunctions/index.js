const logger = Moralis.Cloud.getLogger();

Moralis.Cloud.define("saveSellerDataToFile", async (request) => {
  logger.info("saveSellerDataToFile called...");
  
  const sellerData = request.params.sellerData;
  const dataHash = crypto.createHash('sha256').update(sellerData).digest('hex');
  
  return {
    dataHash
  };
});

Moralis.Cloud.define("loadTestData", async (request) => {
  logger.info("loadTestData called...");
                                     
  return "JTdCJTIybGFzdE5hbWUlMjIlM0ElMjJVc2VyJTIyJTJDJTIyZmlyc3ROYW1lJTIyJTNBJTIyRGV4RGVtbyUyMiUyQyUyMnByb2dyYW1zQWxsb2NhdGlvbiUyMiUzQSU1QiU3QiUyMnByb2dyYW0lMjIlM0ElMjJlZjYyYzIyMC01MGUxLTExZTctOWJkMi0yZjMzNjgwYTY2YjYlMjIlMkMlMjJzdGF0dXMlMjIlM0ElMjJzdG9wJTIyJTJDJTIyc2hvcnRJZCUyMiUzQSUyMjElMjIlMkMlMjJ0eXBlJTIyJTNBJTIyMSUyMiUyQyUyMmZyb21UcyUyMiUzQTE0OTc1MjAxNzI1NDklMkMlMjJ0b1RzJTIyJTNBMTUzNjQwMjg5NzEyMyU3RCUyQyU3QiUyMnByb2dyYW0lMjIlM0ElMjJiYzljZTNlMC04ZjAwLTExZTctYjFmZi05ZmVmODNmYzhhNDIlMjIlMkMlMjJzdGF0dXMlMjIlM0ElMjJzdG9wJTIyJTJDJTIyc2hvcnRJZCUyMiUzQSUyMjElMjIlMkMlMjJ0eXBlJTIyJTNBJTIyMSUyMiUyQyUyMmZyb21UcyUyMiUzQTE1MDQyNjIxMTI5NzglMkMlMjJ0b1RzJTIyJTNBMTUzNTYwNzA4OTc0NyU3RCUyQyU3QiUyMnByb2dyYW0lMjIlM0ElMjIyNTUzYzNiMC01MWIwLTExZTctOWJkMi0yZjMzNjgwYTY2YjYlMjIlMkMlMjJzdGF0dXMlMjIlM0ElMjJzdG9wJTIyJTJDJTIyc2hvcnRJZCUyMiUzQSUyMjElMjIlMkMlMjJ0eXBlJTIyJTNBJTIyMSUyMiUyQyUyMmZyb21UcyUyMiUzQTE1Mjg0NDgwMjY3ODQlMkMlMjJ0b1RzJTIyJTNBMTUzNTk1MTc1MzMwNSU3RCUyQyU3QiUyMnByb2dyYW0lMjIlM0ElMjIxODNmMDI5MC1mNzI2LTExZTctOTE4Ni0zYmNiNWM1ZDIyZGIlMjIlMkMlMjJzdGF0dXMlMjIlM0ElMjJzdG9wJTIyJTJDJTIyc2hvcnRJZCUyMiUzQSUyMjElMjIlMkMlMjJ0eXBlJTIyJTNBJTIyMyUyMiUyQyUyMmZyb21UcyUyMiUzQTE1MTU3MTM1NzMyOTElMkMlMjJ0b1RzJTIyJTNBMTU4MjY1OTYzNDcxOCU3RCUyQyU3QiUyMnByb2dyYW0lMjIlM0ElMjI3MGRjNmJkMC01OWIwLTExZTgtOGQ1NC0yZDU2MmY2Y2JhNTQlMjIlMkMlMjJzdGF0dXMlMjIlM0ElMjJjb21wbGV0ZSUyMiUyQyUyMnNob3J0SWQlMjIlM0ElMjIxJTIyJTJDJTIydHlwZSUyMiUzQSUyMjMlMjIlMkMlMjJmcm9tVHMlMjIlM0ExNTQzODM1MzYzNjQzJTJDJTIydG9UcyUyMiUzQTE1NDYwNzM5NjU2OTQlN0QlMkMlN0IlMjJwcm9ncmFtJTIyJTNBJTIyNDc2YWI4NDAtMWNiNy0xMWU5LTg0ZmUtZTkzNWIzNjUyMjBhJTIyJTJDJTIyc3RhdHVzJTIyJTNBJTIyYWN0aXZlJTIyJTJDJTIyc2hvcnRJZCUyMiUzQSUyMjElMjIlMkMlMjJ0eXBlJTIyJTNBJTIyMSUyMiUyQyUyMmZyb21UcyUyMiUzQTE1NDgwNDMyOTIxODglMkMlMjJ0b1RzJTIyJTNBMTYyMzE1NDQwOTMxMSU3RCUyQyU3QiUyMnByb2dyYW0lMjIlM0ElMjI0OGQ3YjAyMC1lYWIwLTExZWEtYTQ2Ni0wMzM0ZmYwZThiZjIlMjIlMkMlMjJzdGF0dXMlMjIlM0ElMjJhY3RpdmUlMjIlMkMlMjJzaG9ydElkJTIyJTNBJTIyMTA0JTIyJTJDJTIydHlwZSUyMiUzQSUyMjMlMjIlMkMlMjJmcm9tVHMlMjIlM0ExNTk4Nzg2MjIwOTE1JTJDJTIydG9UcyUyMiUzQTE2MjMxNTQ0MDkzMTElN0QlNUQlMkMlMjJfbG9va3VwcyUyMiUzQSU3QiUyMnByb2dyYW1zJTIyJTNBJTdCJTIyYmM5Y2UzZTAtOGYwMC0xMWU3LWIxZmYtOWZlZjgzZmM4YTQyJTIyJTNBJTdCJTIycHJvZ3JhbU5hbWUlMjIlM0ElMjJIeXBlcnRlbnNpb24lMjBJbnNpZ2h0cyUyMEludGVuc2UlMjIlMkMlMjJpbWclMjIlM0ElMjJoaWklMjIlMkMlMjJkZXNjcmlwdGlvbiUyMiUzQSUyMlRoaXMlMjBJbnRlbnNlJTIwcHJvZ3JhbSUyMGFpbXMlMjB0byUyMHByb2R1Y2UlMjBzb21lJTIwYmxvb2QlMjBwcmVzc3VyZSUyMGluc2lnaHRzJTIwZm9yJTIwb3VyJTIwcGF0aWVudCUyMGJhc2UuJTIwVGhlc2UlMjBpbnNpZ2h0cyUyMGNhbiUyMHRoZW4lMjBiZSUyMHVzZWQlMjB0byUyMHRlc3QlMjBzb21lJTIwSHlwb3RoZXNpcyUyMHJlbGF0aW5nJTIwdG8lMjB0aGUlMjAlRTIlODAlOUNEYW5nZXJzJTIwb2YlMjBNb3JuaW5nJTIwQmxvb2QlMjBQcmVzc3VyZSVFMiU4MCU5RCUyQyUyMCU1QyUyMlVudXN1YWwlMjB0cmVuZHMlMjBpbiUyMEFybSUyMHRvJTIwQXJtJTIwQlAlMjBkaWZmZXJlbmNlJTVDJTIyJTIwYXMlMjB3ZWxsJTIwaXMlMjB0aGUlMjB0cmVhdG1lbnQlMjBwbGFuJTIwYSUyMFBhdGllbnQlMjBvbiUyMHJlYWxseSUyMGNvbnRyb2xsaW5nJTIwdGhlaXIlMjBCbG9vZCUyMFByZXNzdXJlLiUyMCU1Q24lNUNuQXQlMjB0aGUlMjBlbmQlMjBvZiUyMHRoZSUyMFByb2dyYW0lMjB0aGUlMjBQYXRlbnQlMjB3aWxsJTIwcmVjZWl2ZSUyMGElMjByZXBvcnQlMjBieSUyMHBvc3QlMjB3aGljaCUyMHdlJTIwd2lsbCUyMHJlY29tbWVuZCUyMHRoZW4lMjB0YWtlJTIwdG8lMjB0aGVpciUyMEdQJTIwb3IlMjBTcGVjaWFsaXN0LiUyMCUyMiUyQyUyMmR1cmF0aW9uJTIyJTNBJTIyMl93ZWVrcyUyMiU3RCUyQyUyMjQ3NmFiODQwLTFjYjctMTFlOS04NGZlLWU5MzViMzY1MjIwYSUyMiUzQSU3QiUyMnByb2dyYW1OYW1lJTIyJTNBJTIyQmxvb2QlMjBQcmVzc3VyZSUyME9uRGVtYW5kJTIyJTJDJTIyaW1nJTIyJTNBJTIyYnBvJTIyJTJDJTIyZGVzY3JpcHRpb24lMjIlM0ElMjJBJTIwcHJvZ3JhbSUyMGZvciUyMHVzZXJzJTIwdG8lMjBsb2clMjBhbmQlMjBjaGVjayUyMGJsb29kJTIwcHJlc3N1cmUlMjBhcyUyMHRoZXklMjBmZWVsLiUyMiUyQyUyMmR1cmF0aW9uJTIyJTNBJTIyb25nb2luZyUyMiU3RCUyQyUyMjI1NTNjM2IwLTUxYjAtMTFlNy05YmQyLTJmMzM2ODBhNjZiNiUyMiUzQSU3QiUyMnByb2dyYW1OYW1lJTIyJTNBJTIyUHJlZ25hbmN5JTIwQ29uZGl0aW9uJTIwTW9uaXRvcmluZyUyMiUyQyUyMmltZyUyMiUzQSUyMnBjbSUyMiUyQyUyMmRlc2NyaXB0aW9uJTIyJTNBJTIyTmV3JTIwSHlwZXJ0ZW5zaW9uJTIwb2NjdXJzJTIwaW4lMjA4LTEwJTI1JTIwb2YlMjBwcmVnbmFuY2llcyUyMGFuZCUyMG1hbnklMjB3b21lbiUyMGRldmVsb3AlMjBkZXByZXNzaW9uJTIwZHVyaW5nJTIwdGhpcyUyMHBlcmlvZC4lMjIlMkMlMjJkdXJhdGlvbiUyMiUzQSUyMjMwX3dlZWtzJTIyJTdEJTJDJTIyNzBkYzZiZDAtNTliMC0xMWU4LThkNTQtMmQ1NjJmNmNiYTU0JTIyJTNBJTdCJTIycHJvZ3JhbU5hbWUlMjIlM0ElMjJSZWQlMjBIZWFydCUyMENoYWxsZW5nZSUyMiUyQyUyMmltZyUyMiUzQSUyMnJoYyUyMiUyQyUyMmRlc2NyaXB0aW9uJTIyJTNBJTIyQSUyMDMlMjB3ZWVrJTIwY2hhbGxlbmdlJTIwdG8lMjBnZW5lcmF0ZSUyMHNvbWUlMjBIZWFydCUyMEhlYWx0aCUyMGluc2lnaHRzJTIwYnklMjBjb2xsZWN0aW5nJTIwQmxvb2QlMjBQcmVzc3VyZSUyMHJlYWRpbmdzJTJDJTIwU3RyZXNzJTIwUmVhZGluZ3MlMjBldGMlMjIlMkMlMjJkdXJhdGlvbiUyMiUzQSUyMjNfd2Vla3MlMjIlN0QlMkMlMjIxODNmMDI5MC1mNzI2LTExZTctOTE4Ni0zYmNiNWM1ZDIyZGIlMjIlM0ElN0IlMjJwcm9ncmFtTmFtZSUyMiUzQSUyMkNocm9uaWMlMjBXb3VuZHMlMjBIZWFsaW5nJTIwUHJvZ3Jlc3MlMjBUcmFja2VyJTIyJTJDJTIyZGVzY3JpcHRpb24lMjIlM0ElMjJDaHJvbmljJTIwV291bmRzJTIwSGVhbGluZyUyMFByb2dyZXNzJTIwVHJhY2tlciUyMiUyQyUyMmltZyUyMiUzQSUyMmN3aCUyMiUyQyUyMmR1cmF0aW9uJTIyJTNBJTIyNF93ZWVrcyUyMiU3RCUyQyUyMmVmNjJjMjIwLTUwZTEtMTFlNy05YmQyLTJmMzM2ODBhNjZiNiUyMiUzQSU3QiUyMnByb2dyYW1OYW1lJTIyJTNBJTIyQmxvb2QlMjBQcmVzc3VyZSUyMFRyYWNrZXIlMjIlMkMlMjJpbWclMjIlM0ElMjJicHQlMjIlMkMlMjJkZXNjcmlwdGlvbiUyMiUzQSUyMkh5cGVydGVuc2lvbiUyMGlzJTIwZGVmaW5lZCUyMGFzJTIwYSUyMHN5c3RvbGljJTIwYmxvb2QlMjBwcmVzc3VyZSUyMG9mJTIwMTQwJTIwbW0lMjBIZyUyMG9yJTIwbW9yZSUyQyUyMG9yJTIwYSUyMGRpYXN0b2xpYyUyMGJsb29kJTIwcHJlc3N1cmUlMjBvZiUyMDkwJTIwbW0lMjBIZyUyMG9yJTIwbW9yZSUyQyUyMG9yJTIwdGFraW5nJTIwYW50aWh5cGVydGVuc2l2ZSUyMG1lZGljYXRpb24uJTIwSXQlMjBpcyUyMGVzdGltYXRlZCUyMHRoYXQlMjAxJTIwaW4lMjAzJTIwcGVvcGxlJTIwZ2xvYmFsbHklMjBzdXBwZXIlMjBmcm9tJTIwSHlwZXJ0ZW5zaW9uLiU1Q24lNUNuVGhpcyUyMFByb2dyYW0lMjBpcyUyMHRvJTIwaGVscCUyMGFueW9uZSUyMGxpdmluZyUyMHdpdGglMjBIeXBlcnRlbnNpb24lMjBvciUyME1pbGQlMjBIeXBlcnRlbnNpb24lMjB0byUyMGJldHRlciUyMG1hbmdlciUyMHRoZWlyJTIwY29uZGl0aW9uJTIwd2l0aCUyMHByb2FjdGl2ZSUyMG1vbml0b3JpbmclMjBhbmQlMjB0cmFja2luZy4lMjBJdCUyN3MlMjBhbHNvJTIwZGVzaWduZWQlMjB0byUyMGhlbHAlMjBhbnlvbmUlMjB0cmFjayUyMGFuZCUyMG1vbml0b3IlMjB0aGVpciUyMGxvdmVkJTIwb25lcyUyMGxpdmluZyUyMHdpdGglMjB0aGlzJTIwY29uZGl0aW9uJTIwYXMlMjB3ZWxsLiUyMiUyQyUyMmR1cmF0aW9uJTIyJTNBJTIyb25nb2luZyUyMiU3RCUyQyUyMjQ4ZDdiMDIwLWVhYjAtMTFlYS1hNDY2LTAzMzRmZjBlOGJmMiUyMiUzQSU3QiUyMnByb2dyYW1OYW1lJTIyJTNBJTIyT2tQdWxzZSUyMiUyQyUyMmltZyUyMiUzQSUyMm9rcHVsc2UlMjIlMkMlMjJkZXNjcmlwdGlvbiUyMiUzQSUyMldlJTIwd291bGQlMjBsaWtlJTIwdG8lMjB1bmRlcnN0YW5kJTIwaG93JTIwd2UlMjBjYW4lMjBiZXN0JTIwc3VwcG9ydCUyMHlvdSUyMGFzJTIweW91JTIwd29yayUyMHJlbW90ZWx5LiUyMFRoaXMlMjBwcm9ncmFtJTIwcHJvdmlkZXMlMjB1cyUyMHdpdGglMjBhJTIwbGl2aW5nJTIwcHVsc2UlMjBvbiUyMHlvdXIlMjBtb3RpdmF0aW9uJTJDJTIwcHJvZHVjdGl2aXR5JTJDJTIwZW5nYWdlbWVudCUyMGxldmVscyUyMGFuZCUyMGdlbmVyYWwlMjBoZWFsdGglMjBhbmQlMjB3ZWxsYmVpbmcuJTIyJTJDJTIyZHVyYXRpb24lMjIlM0ElMjJvbmdvaW5nJTIyJTdEJTdEJTdEJTdE";
});

Moralis.Cloud.define("getUserPurchaseDataOrders", function(request) {
  logger.info("getUserPurchaseDataOrders called...");

  const userAddress = request.params.userAddress;
  const networkId = request.params.networkId;

  const query = new Moralis.Query("DataOrder");
  query.descending("createdAt");
  query.equalTo("txNetworkId", networkId);
  
  const pipeline = [
    {match: {$expr: {$or: [
      {$eq: ["$buyerEthAddress", userAddress]},
    ]}}},
    
    {lookup: {
      from: "DataPack",
      localField: "dataPackId",
      foreignField: "_id",
      as: "dataPack"
    }}
  ];
  
  return query.aggregate(pipeline);
});

function generateDataNFTUiObject(currDataNFT, options = {}) {
  const { hideFileUrl } = options;

  const dataNFT = {};
  dataNFT.id = currDataNFT.id;
  dataNFT.nftImgUrl = currDataNFT.get('nftImgUrl');
  dataNFT.dataPreview = currDataNFT.get('dataPreview');
  dataNFT.nftName = currDataNFT.get('nftName');
  dataNFT.txHash = currDataNFT.get('txHash');
  dataNFT.txNFTId = currDataNFT.get('txNFTId');
  dataNFT.termsOfUseId = currDataNFT.get('termsOfUseId');
  dataNFT.txNetworkId = currDataNFT.get('txNetworkId');
  dataNFT.sellerEthAddress = currDataNFT.get('sellerEthAddress');
  dataNFT.feeInMyda = currDataNFT.get('feeInMyda');

  if (!hideFileUrl) {
    if (!currDataNFT.get('type') || currDataNFT.get('type') !== 'datastream') {
      dataNFT.dataFileUrl = currDataNFT.get('dataFile').url();
    }
  }

  return dataNFT;
}

Moralis.Cloud.define("getUserDataNFTCatalog", async (request) => {
  logger.info("getUserDataNFTCatalog called...");

  const {myOnChainNFTs, networkId, ethAddress} = request.params;

  const query = new Moralis.Query("DataNFT");
  query.descending("createdAt");
  query.notEqualTo("txHash", null);
  query.equalTo("txNetworkId", networkId);

  const allDataNFTs = await query.find();

  const myOnChainNFTIds = myOnChainNFTs.map(i => i.token_id);

  const allUserDataNFTs = [];

  for (let i = 0; i < allDataNFTs.length; ++i) {
    if (myOnChainNFTIds.includes(allDataNFTs[i].get("txNFTId"))) {
      /*
        covers case of:
        1) original minter still owning it
        2) original being sold and someone else owning it
      */

      const newUserDataNFT = generateDataNFTUiObject(allDataNFTs[i]);

      if (allDataNFTs[i].get("sellerEthAddress") === ethAddress) { //(1)
        // i still own it...
        newUserDataNFT.stillOwns = true;
      } else if (allDataNFTs[i].get("sellerEthAddress") !== ethAddress) { //(2)
        // i purchased it from someone else...
        newUserDataNFT.stillOwns = true;
        newUserDataNFT.currentOwner = ethAddress;
        newUserDataNFT.originalOwner = allDataNFTs[i].get('sellerEthAddress');
      }
    
      allUserDataNFTs.push(newUserDataNFT);
    } else {
      /*
        covers case of:
        1) current logged in user not owning anything
        2) current logged in user not owning it anymore
      */

      if (allDataNFTs[i].get("sellerEthAddress") === ethAddress) { //(2)
        allUserDataNFTs.push(generateDataNFTUiObject(allDataNFTs[i]));
      }
    }
  }

  return allUserDataNFTs;
});

Moralis.Cloud.define("getAllDataNFTs", async (request) => {
  logger.info("getAllDataNFTs called...");

  const {ethAddress} = request.params;

  const query = new Moralis.Query("DataNFT");
  query.descending("createdAt");
  query.notEqualTo("txHash", null);
  query.notEqualTo("sellerEthAddress", ethAddress);

  const allDataNFTs = await query.find();

  const allMarketplaceDataNFTs = [];

  for (let i = 0; i < allDataNFTs.length; ++i) {
    const newUserDataNFT = generateDataNFTUiObject(allDataNFTs[i], {
      hideFileUrl: true
    });

    allMarketplaceDataNFTs.push(newUserDataNFT);
  }

  return allMarketplaceDataNFTs;
});
