export type CoreSolBondStakeSc = {
  "version": "1.0.0";
  "name": "core_sol_bond_stake_sc";
  "instructions": [
    {
      "name": "initializeContract";
      "accounts": [
        {
          "name": "bondConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "rewardsConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "merkleTree";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "associatedTokenProgram";
          "isMut": false;
          "isSigner": false;
        },
      ];
      "args": [
        {
          "name": "index";
          "type": "u8";
        },
        {
          "name": "lockPeriod";
          "type": "u64";
        },
        {
          "name": "bondAmount";
          "type": "u64";
        },
        {
          "name": "rewardsPerSlot";
          "type": "u64";
        },
        {
          "name": "maxApr";
          "type": "u64";
        },
        {
          "name": "withdrawPenalty";
          "type": "u64";
        },
      ];
    },
    {
      "name": "initializeVault";
      "accounts": [
        {
          "name": "vaultConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vault";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "mintOfToken";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "associatedTokenProgram";
          "isMut": false;
          "isSigner": false;
        },
      ];
      "args": [];
    },
    {
      "name": "createBondConfig";
      "accounts": [
        {
          "name": "bondConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "merkleTree";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        },
      ];
      "args": [
        {
          "name": "index";
          "type": "u8";
        },
        {
          "name": "lockPeriod";
          "type": "u64";
        },
        {
          "name": "bondAmount";
          "type": "u64";
        },
        {
          "name": "withdrawPenalty";
          "type": "u64";
        },
      ];
    },
    {
      "name": "setBondStateActive";
      "accounts": [
        {
          "name": "bondConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
      ];
      "args": [
        {
          "name": "index";
          "type": "u8";
        },
      ];
    },
    {
      "name": "setBondStateInactive";
      "accounts": [
        {
          "name": "bondConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
      ];
      "args": [
        {
          "name": "index";
          "type": "u8";
        },
      ];
    },
    {
      "name": "updateMerkleTree";
      "accounts": [
        {
          "name": "bondConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
      ];
      "args": [
        {
          "name": "index";
          "type": "u8";
        },
        {
          "name": "merkleTree";
          "type": "publicKey";
        },
      ];
    },
    {
      "name": "updateLockPeriod";
      "accounts": [
        {
          "name": "bondConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
      ];
      "args": [
        {
          "name": "index";
          "type": "u8";
        },
        {
          "name": "lockPeriod";
          "type": "u64";
        },
      ];
    },
    {
      "name": "updateBondAmount";
      "accounts": [
        {
          "name": "bondConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
      ];
      "args": [
        {
          "name": "index";
          "type": "u8";
        },
        {
          "name": "bondAmount";
          "type": "u64";
        },
      ];
    },
    {
      "name": "updateWithdrawPenalty";
      "accounts": [
        {
          "name": "bondConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
      ];
      "args": [
        {
          "name": "index";
          "type": "u8";
        },
        {
          "name": "withdrawPenalty";
          "type": "u64";
        },
      ];
    },
    {
      "name": "setRewardsStateActive";
      "accounts": [
        {
          "name": "rewardsConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
      ];
      "args": [];
    },
    {
      "name": "setRewardsStateInactive";
      "accounts": [
        {
          "name": "rewardsConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
      ];
      "args": [];
    },
    {
      "name": "updateRewardsPerSlot";
      "accounts": [
        {
          "name": "rewardsConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
      ];
      "args": [
        {
          "name": "rewardsPerSlot";
          "type": "u64";
        },
      ];
    },
    {
      "name": "updateMaxApr";
      "accounts": [
        {
          "name": "rewardsConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
      ];
      "args": [
        {
          "name": "maxApr";
          "type": "u64";
        },
      ];
    },
    {
      "name": "addRewards";
      "accounts": [
        {
          "name": "rewardsConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vaultConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vault";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "mintOfToken";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "authorityTokenAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "associatedTokenProgram";
          "isMut": false;
          "isSigner": false;
        },
      ];
      "args": [
        {
          "name": "amount";
          "type": "u64";
        },
      ];
    },
    {
      "name": "removeRewards";
      "accounts": [
        {
          "name": "rewardsConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vaultConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vault";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "mintOfToken";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "authorityTokenAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "associatedTokenProgram";
          "isMut": false;
          "isSigner": false;
        },
      ];
      "args": [
        {
          "name": "amount";
          "type": "u64";
        },
      ];
    },
    {
      "name": "initializeAddress";
      "accounts": [
        {
          "name": "addressBondsRewards";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "rewardsConfig";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        },
      ];
      "args": [];
    },
    {
      "name": "bond";
      "accounts": [
        {
          "name": "addressBondsRewards";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "assetUsage";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bond";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bondConfig";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "rewardsConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vaultConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vault";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "mintOfTokenSent";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "merkleTree";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "authorityTokenAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "associatedTokenProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "compressionProgram";
          "isMut": false;
          "isSigner": false;
        },
      ];
      "args": [
        {
          "name": "bondConfigIndex";
          "type": "u8";
        },
        {
          "name": "bondId";
          "type": "u16";
        },
        {
          "name": "amount";
          "type": "u64";
        },
        {
          "name": "nonce";
          "type": "u64";
        },
        {
          "name": "root";
          "type": {
            "array": ["u8", 32];
          };
        },
        {
          "name": "dataHash";
          "type": {
            "array": ["u8", 32];
          };
        },
        {
          "name": "creatorHash";
          "type": {
            "array": ["u8", 32];
          };
        },
      ];
    },
    {
      "name": "updateVaultBond";
      "accounts": [
        {
          "name": "addressBondsRewards";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bond";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bondConfig";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        },
      ];
      "args": [
        {
          "name": "bondConfigIndex";
          "type": "u8";
        },
        {
          "name": "bondId";
          "type": "u16";
        },
        {
          "name": "nonce";
          "type": "u64";
        },
      ];
    },
    {
      "name": "renew";
      "accounts": [
        {
          "name": "bondConfig";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "rewardsConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vaultConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "addressBondsRewards";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bond";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
      ];
      "args": [
        {
          "name": "bondConfigIndex";
          "type": "u8";
        },
        {
          "name": "bondId";
          "type": "u16";
        },
      ];
    },
    {
      "name": "withdraw";
      "accounts": [
        {
          "name": "bondConfig";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "addressBondsRewards";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "rewardsConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bond";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vaultConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vault";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "mintOfTokenToReceive";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "authorityTokenAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "associatedTokenProgram";
          "isMut": false;
          "isSigner": false;
        },
      ];
      "args": [
        {
          "name": "bondConfigIndex";
          "type": "u8";
        },
        {
          "name": "bondId";
          "type": "u16";
        },
      ];
    },
    {
      "name": "topUp";
      "accounts": [
        {
          "name": "addressBondsRewards";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bondConfig";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "rewardsConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "mintOfTokenSent";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "bond";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vaultConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vault";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "authorityTokenAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "associatedTokenProgram";
          "isMut": false;
          "isSigner": false;
        },
      ];
      "args": [
        {
          "name": "bondConfigIndex";
          "type": "u8";
        },
        {
          "name": "bondId";
          "type": "u16";
        },
        {
          "name": "amount";
          "type": "u64";
        },
      ];
    },
    {
      "name": "stakeRewards";
      "accounts": [
        {
          "name": "addressBondsRewards";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bond";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bondConfig";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "rewardsConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vaultConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
      ];
      "args": [
        {
          "name": "bondConfigIndex";
          "type": "u8";
        },
        {
          "name": "bondId";
          "type": "u16";
        },
      ];
    },
    {
      "name": "claimRewards";
      "accounts": [
        {
          "name": "addressBondsRewards";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bondConfig";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "bond";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "rewardsConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vaultConfig";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "vault";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "mintOfTokenToReceive";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "authority";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "authorityTokenAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "associatedTokenProgram";
          "isMut": false;
          "isSigner": false;
        },
      ];
      "args": [
        {
          "name": "bondConfigIndex";
          "type": "u8";
        },
        {
          "name": "bondId";
          "type": "u16";
        },
      ];
    },
  ];
  "accounts": [
    {
      "name": "addressBondsRewards";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "bump";
            "type": "u8";
          },
          {
            "name": "address";
            "type": "publicKey";
          },
          {
            "name": "addressTotalBondAmount";
            "type": "u64";
          },
          {
            "name": "currentIndex";
            "type": "u16";
          },
          {
            "name": "lastUpdateTimestamp";
            "type": "u64";
          },
          {
            "name": "addressRewardsPerShare";
            "type": "u64";
          },
          {
            "name": "claimableAmount";
            "type": "u64";
          },
          {
            "name": "vaultBondId";
            "type": "u16";
          },
          {
            "name": "padding";
            "type": {
              "array": ["u8", 16];
            };
          },
        ];
      };
    },
    {
      "name": "assetUsage";
      "type": {
        "kind": "struct";
        "fields": [];
      };
    },
    {
      "name": "bondConfig";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "bump";
            "type": "u8";
          },
          {
            "name": "index";
            "type": "u8";
          },
          {
            "name": "bondState";
            "type": "u8";
          },
          {
            "name": "merkleTree";
            "type": "publicKey";
          },
          {
            "name": "lockPeriod";
            "type": "u64";
          },
          {
            "name": "bondAmount";
            "type": "u64";
          },
          {
            "name": "withdrawPenalty";
            "type": "u64";
          },
          {
            "name": "padding";
            "type": {
              "array": ["u8", 32];
            };
          },
        ];
      };
    },
    {
      "name": "bond";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "bump";
            "type": "u8";
          },
          {
            "name": "state";
            "type": "u8";
          },
          {
            "name": "bondTimestamp";
            "type": "u64";
          },
          {
            "name": "unbondTimestamp";
            "type": "u64";
          },
          {
            "name": "bondAmount";
            "type": "u64";
          },
          {
            "name": "assetId";
            "type": "publicKey";
          },
          {
            "name": "owner";
            "type": "publicKey";
          },
          {
            "name": "padding";
            "type": {
              "array": ["u8", 64];
            };
          },
        ];
      };
    },
    {
      "name": "rewardsConfig";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "bump";
            "type": "u8";
          },
          {
            "name": "rewardsState";
            "type": "u8";
          },
          {
            "name": "rewardsReserve";
            "type": "u64";
          },
          {
            "name": "accumulatedRewards";
            "type": "u64";
          },
          {
            "name": "rewardsPerSlot";
            "type": "u64";
          },
          {
            "name": "rewardsPerShare";
            "type": "u64";
          },
          {
            "name": "lastRewardSlot";
            "type": "u64";
          },
          {
            "name": "maxApr";
            "type": "u64";
          },
          {
            "name": "padding";
            "type": {
              "array": ["u8", 32];
            };
          },
        ];
      };
    },
    {
      "name": "vaultConfig";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "bump";
            "type": "u8";
          },
          {
            "name": "vault";
            "type": "publicKey";
          },
          {
            "name": "mintOfToken";
            "type": "publicKey";
          },
          {
            "name": "totalBondAmount";
            "type": "u64";
          },
          {
            "name": "totalPenalizedAmount";
            "type": "u64";
          },
          {
            "name": "padding";
            "type": {
              "array": ["u8", 32];
            };
          },
        ];
      };
    },
  ];
  "types": [
    {
      "name": "State";
      "type": {
        "kind": "enum";
        "variants": [
          {
            "name": "Inactive";
          },
          {
            "name": "Active";
          },
        ];
      };
    },
  ];
  "errors": [
    {
      "code": 6000;
      "name": "ProgramIsPaused";
      "msg": "Program is paused";
    },
    {
      "code": 6001;
      "name": "NotWhitelisted";
      "msg": "Not whitelisted";
    },
    {
      "code": 6002;
      "name": "NotWholeNumber";
      "msg": "Not whole number";
    },
    {
      "code": 6003;
      "name": "NotPrivileged";
      "msg": "Not privileged";
    },
    {
      "code": 6004;
      "name": "NotEnoughBalance";
      "msg": "Not enough balance";
    },
    {
      "code": 6005;
      "name": "OwnerMismatch";
      "msg": "Owner mismatch";
    },
    {
      "code": 6006;
      "name": "MintMismatch";
      "msg": "Mint mismatch";
    },
    {
      "code": 6007;
      "name": "MetadataAccountMismatch";
      "msg": "Metadata account mismatch";
    },
    {
      "code": 6008;
      "name": "MintFromWrongCollection";
      "msg": "Mint from wrong collection";
    },
    {
      "code": 6009;
      "name": "NotTheMintCreator";
      "msg": "Not the Mint creator";
    },
    {
      "code": 6010;
      "name": "WrongAmount";
      "msg": "Wrong amount";
    },
    {
      "code": 6011;
      "name": "WrongBondId";
      "msg": "Wrong bond id";
    },
    {
      "code": 6012;
      "name": "InvalidRemainingAccounts";
      "msg": "Invalid remaining accounts";
    },
    {
      "code": 6013;
      "name": "WrongValue";
      "msg": "Wrong value";
    },
    {
      "code": 6014;
      "name": "BondIsInactive";
      "msg": "Bond is inactive";
    },
    {
      "code": 6015;
      "name": "BondIsNotAVault";
      "msg": "Bond is not a vault";
    },
    {
      "code": 6016;
      "name": "MerkleTreeMismatch";
      "msg": "Merkle tree mismatch";
    },
    {
      "code": 6017;
      "name": "NotCreator";
      "msg": "Not creator";
    },
    {
      "code": 6018;
      "name": "AssetIdMismatch";
      "msg": "Asset Id mismatch";
    },
    {
      "code": 6019;
      "name": "VaultBondIdMismatch";
      "msg": "Vault bond id mismatch";
    },
  ];
};

export const IDL: CoreSolBondStakeSc = {
  "version": "1.0.0",
  "name": "core_sol_bond_stake_sc",
  "instructions": [
    {
      "name": "initializeContract",
      "accounts": [
        {
          "name": "bondConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "rewardsConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "merkleTree",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false,
        },
      ],
      "args": [
        {
          "name": "index",
          "type": "u8",
        },
        {
          "name": "lockPeriod",
          "type": "u64",
        },
        {
          "name": "bondAmount",
          "type": "u64",
        },
        {
          "name": "rewardsPerSlot",
          "type": "u64",
        },
        {
          "name": "maxApr",
          "type": "u64",
        },
        {
          "name": "withdrawPenalty",
          "type": "u64",
        },
      ],
    },
    {
      "name": "initializeVault",
      "accounts": [
        {
          "name": "vaultConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "mintOfToken",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false,
        },
      ],
      "args": [],
    },
    {
      "name": "createBondConfig",
      "accounts": [
        {
          "name": "bondConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "merkleTree",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
        },
      ],
      "args": [
        {
          "name": "index",
          "type": "u8",
        },
        {
          "name": "lockPeriod",
          "type": "u64",
        },
        {
          "name": "bondAmount",
          "type": "u64",
        },
        {
          "name": "withdrawPenalty",
          "type": "u64",
        },
      ],
    },
    {
      "name": "setBondStateActive",
      "accounts": [
        {
          "name": "bondConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
      ],
      "args": [
        {
          "name": "index",
          "type": "u8",
        },
      ],
    },
    {
      "name": "setBondStateInactive",
      "accounts": [
        {
          "name": "bondConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
      ],
      "args": [
        {
          "name": "index",
          "type": "u8",
        },
      ],
    },
    {
      "name": "updateMerkleTree",
      "accounts": [
        {
          "name": "bondConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
      ],
      "args": [
        {
          "name": "index",
          "type": "u8",
        },
        {
          "name": "merkleTree",
          "type": "publicKey",
        },
      ],
    },
    {
      "name": "updateLockPeriod",
      "accounts": [
        {
          "name": "bondConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
      ],
      "args": [
        {
          "name": "index",
          "type": "u8",
        },
        {
          "name": "lockPeriod",
          "type": "u64",
        },
      ],
    },
    {
      "name": "updateBondAmount",
      "accounts": [
        {
          "name": "bondConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
      ],
      "args": [
        {
          "name": "index",
          "type": "u8",
        },
        {
          "name": "bondAmount",
          "type": "u64",
        },
      ],
    },
    {
      "name": "updateWithdrawPenalty",
      "accounts": [
        {
          "name": "bondConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
      ],
      "args": [
        {
          "name": "index",
          "type": "u8",
        },
        {
          "name": "withdrawPenalty",
          "type": "u64",
        },
      ],
    },
    {
      "name": "setRewardsStateActive",
      "accounts": [
        {
          "name": "rewardsConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
      ],
      "args": [],
    },
    {
      "name": "setRewardsStateInactive",
      "accounts": [
        {
          "name": "rewardsConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
      ],
      "args": [],
    },
    {
      "name": "updateRewardsPerSlot",
      "accounts": [
        {
          "name": "rewardsConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
      ],
      "args": [
        {
          "name": "rewardsPerSlot",
          "type": "u64",
        },
      ],
    },
    {
      "name": "updateMaxApr",
      "accounts": [
        {
          "name": "rewardsConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
      ],
      "args": [
        {
          "name": "maxApr",
          "type": "u64",
        },
      ],
    },
    {
      "name": "addRewards",
      "accounts": [
        {
          "name": "rewardsConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vaultConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "mintOfToken",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
        {
          "name": "authorityTokenAccount",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false,
        },
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64",
        },
      ],
    },
    {
      "name": "removeRewards",
      "accounts": [
        {
          "name": "rewardsConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vaultConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "mintOfToken",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
        {
          "name": "authorityTokenAccount",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false,
        },
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64",
        },
      ],
    },
    {
      "name": "initializeAddress",
      "accounts": [
        {
          "name": "addressBondsRewards",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "rewardsConfig",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
        },
      ],
      "args": [],
    },
    {
      "name": "bond",
      "accounts": [
        {
          "name": "addressBondsRewards",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "assetUsage",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "bond",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "bondConfig",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "rewardsConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vaultConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "mintOfTokenSent",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
        {
          "name": "merkleTree",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "authorityTokenAccount",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false,
        },
      ],
      "args": [
        {
          "name": "bondConfigIndex",
          "type": "u8",
        },
        {
          "name": "bondId",
          "type": "u16",
        },
        {
          "name": "amount",
          "type": "u64",
        },
        {
          "name": "nonce",
          "type": "u64",
        },
        {
          "name": "root",
          "type": {
            "array": ["u8", 32],
          },
        },
        {
          "name": "dataHash",
          "type": {
            "array": ["u8", 32],
          },
        },
        {
          "name": "creatorHash",
          "type": {
            "array": ["u8", 32],
          },
        },
      ],
    },
    {
      "name": "updateVaultBond",
      "accounts": [
        {
          "name": "addressBondsRewards",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "bond",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "bondConfig",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
        },
      ],
      "args": [
        {
          "name": "bondConfigIndex",
          "type": "u8",
        },
        {
          "name": "bondId",
          "type": "u16",
        },
        {
          "name": "nonce",
          "type": "u64",
        },
      ],
    },
    {
      "name": "renew",
      "accounts": [
        {
          "name": "bondConfig",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "rewardsConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vaultConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "addressBondsRewards",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "bond",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
      ],
      "args": [
        {
          "name": "bondConfigIndex",
          "type": "u8",
        },
        {
          "name": "bondId",
          "type": "u16",
        },
      ],
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "bondConfig",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "addressBondsRewards",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "rewardsConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "bond",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vaultConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "mintOfTokenToReceive",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
        {
          "name": "authorityTokenAccount",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false,
        },
      ],
      "args": [
        {
          "name": "bondConfigIndex",
          "type": "u8",
        },
        {
          "name": "bondId",
          "type": "u16",
        },
      ],
    },
    {
      "name": "topUp",
      "accounts": [
        {
          "name": "addressBondsRewards",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "bondConfig",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "rewardsConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "mintOfTokenSent",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "bond",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vaultConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
        {
          "name": "authorityTokenAccount",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false,
        },
      ],
      "args": [
        {
          "name": "bondConfigIndex",
          "type": "u8",
        },
        {
          "name": "bondId",
          "type": "u16",
        },
        {
          "name": "amount",
          "type": "u64",
        },
      ],
    },
    {
      "name": "stakeRewards",
      "accounts": [
        {
          "name": "addressBondsRewards",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "bond",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "bondConfig",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "rewardsConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vaultConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
      ],
      "args": [
        {
          "name": "bondConfigIndex",
          "type": "u8",
        },
        {
          "name": "bondId",
          "type": "u16",
        },
      ],
    },
    {
      "name": "claimRewards",
      "accounts": [
        {
          "name": "addressBondsRewards",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "bondConfig",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "bond",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "rewardsConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vaultConfig",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "mintOfTokenToReceive",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
        },
        {
          "name": "authorityTokenAccount",
          "isMut": true,
          "isSigner": false,
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false,
        },
      ],
      "args": [
        {
          "name": "bondConfigIndex",
          "type": "u8",
        },
        {
          "name": "bondId",
          "type": "u16",
        },
      ],
    },
  ],
  "accounts": [
    {
      "name": "addressBondsRewards",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8",
          },
          {
            "name": "address",
            "type": "publicKey",
          },
          {
            "name": "addressTotalBondAmount",
            "type": "u64",
          },
          {
            "name": "currentIndex",
            "type": "u16",
          },
          {
            "name": "lastUpdateTimestamp",
            "type": "u64",
          },
          {
            "name": "addressRewardsPerShare",
            "type": "u64",
          },
          {
            "name": "claimableAmount",
            "type": "u64",
          },
          {
            "name": "vaultBondId",
            "type": "u16",
          },
          {
            "name": "padding",
            "type": {
              "array": ["u8", 16],
            },
          },
        ],
      },
    },
    {
      "name": "assetUsage",
      "type": {
        "kind": "struct",
        "fields": [],
      },
    },
    {
      "name": "bondConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8",
          },
          {
            "name": "index",
            "type": "u8",
          },
          {
            "name": "bondState",
            "type": "u8",
          },
          {
            "name": "merkleTree",
            "type": "publicKey",
          },
          {
            "name": "lockPeriod",
            "type": "u64",
          },
          {
            "name": "bondAmount",
            "type": "u64",
          },
          {
            "name": "withdrawPenalty",
            "type": "u64",
          },
          {
            "name": "padding",
            "type": {
              "array": ["u8", 32],
            },
          },
        ],
      },
    },
    {
      "name": "bond",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8",
          },
          {
            "name": "state",
            "type": "u8",
          },
          {
            "name": "bondTimestamp",
            "type": "u64",
          },
          {
            "name": "unbondTimestamp",
            "type": "u64",
          },
          {
            "name": "bondAmount",
            "type": "u64",
          },
          {
            "name": "assetId",
            "type": "publicKey",
          },
          {
            "name": "owner",
            "type": "publicKey",
          },
          {
            "name": "padding",
            "type": {
              "array": ["u8", 64],
            },
          },
        ],
      },
    },
    {
      "name": "rewardsConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8",
          },
          {
            "name": "rewardsState",
            "type": "u8",
          },
          {
            "name": "rewardsReserve",
            "type": "u64",
          },
          {
            "name": "accumulatedRewards",
            "type": "u64",
          },
          {
            "name": "rewardsPerSlot",
            "type": "u64",
          },
          {
            "name": "rewardsPerShare",
            "type": "u64",
          },
          {
            "name": "lastRewardSlot",
            "type": "u64",
          },
          {
            "name": "maxApr",
            "type": "u64",
          },
          {
            "name": "padding",
            "type": {
              "array": ["u8", 32],
            },
          },
        ],
      },
    },
    {
      "name": "vaultConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8",
          },
          {
            "name": "vault",
            "type": "publicKey",
          },
          {
            "name": "mintOfToken",
            "type": "publicKey",
          },
          {
            "name": "totalBondAmount",
            "type": "u64",
          },
          {
            "name": "totalPenalizedAmount",
            "type": "u64",
          },
          {
            "name": "padding",
            "type": {
              "array": ["u8", 32],
            },
          },
        ],
      },
    },
  ],
  "types": [
    {
      "name": "State",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Inactive",
          },
          {
            "name": "Active",
          },
        ],
      },
    },
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ProgramIsPaused",
      "msg": "Program is paused",
    },
    {
      "code": 6001,
      "name": "NotWhitelisted",
      "msg": "Not whitelisted",
    },
    {
      "code": 6002,
      "name": "NotWholeNumber",
      "msg": "Not whole number",
    },
    {
      "code": 6003,
      "name": "NotPrivileged",
      "msg": "Not privileged",
    },
    {
      "code": 6004,
      "name": "NotEnoughBalance",
      "msg": "Not enough balance",
    },
    {
      "code": 6005,
      "name": "OwnerMismatch",
      "msg": "Owner mismatch",
    },
    {
      "code": 6006,
      "name": "MintMismatch",
      "msg": "Mint mismatch",
    },
    {
      "code": 6007,
      "name": "MetadataAccountMismatch",
      "msg": "Metadata account mismatch",
    },
    {
      "code": 6008,
      "name": "MintFromWrongCollection",
      "msg": "Mint from wrong collection",
    },
    {
      "code": 6009,
      "name": "NotTheMintCreator",
      "msg": "Not the Mint creator",
    },
    {
      "code": 6010,
      "name": "WrongAmount",
      "msg": "Wrong amount",
    },
    {
      "code": 6011,
      "name": "WrongBondId",
      "msg": "Wrong bond id",
    },
    {
      "code": 6012,
      "name": "InvalidRemainingAccounts",
      "msg": "Invalid remaining accounts",
    },
    {
      "code": 6013,
      "name": "WrongValue",
      "msg": "Wrong value",
    },
    {
      "code": 6014,
      "name": "BondIsInactive",
      "msg": "Bond is inactive",
    },
    {
      "code": 6015,
      "name": "BondIsNotAVault",
      "msg": "Bond is not a vault",
    },
    {
      "code": 6016,
      "name": "MerkleTreeMismatch",
      "msg": "Merkle tree mismatch",
    },
    {
      "code": 6017,
      "name": "NotCreator",
      "msg": "Not creator",
    },
    {
      "code": 6018,
      "name": "AssetIdMismatch",
      "msg": "Asset Id mismatch",
    },
    {
      "code": 6019,
      "name": "VaultBondIdMismatch",
      "msg": "Vault bond id mismatch",
    },
  ],
};
