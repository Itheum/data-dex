import { useEffect, useState } from 'react';
import { useMoralis, useNewMoralisObject, useMoralisCloudFunction, useMoralisFile } from 'react-moralis';
import { Heading, Box, Stack } from '@chakra-ui/layout';
import {
  Button, Input,
  Alert, AlertIcon, AlertTitle, CloseButton,
  useToast
} from '@chakra-ui/react';

import { dataTemplates } from './util';

export default function() {
  const { user } = useMoralis();
  const toast = useToast();
  const [sellerEthAddress, setSellerEthAddress] = useState(user.get('ethAddress'));
  const [sellerDataPreview, setSellerDataPreview] = useState('');
  const [sellerData, setSellerData] = useState('');

  const { 
    error: errDataPackSave,
    isSaving,
    save: saveDataPack } = useNewMoralisObject('DataPack');

  const {
    error: errCfHashData,
    isLoading: loadingCfHashData,
    fetch: doCfHashData,
    data: dataCfHashData
  } = useMoralisCloudFunction("saveSellerDataToFile", { sellerData }, { autoFetch: false });

  const {
    error: errFileSave,
    isUploading: loadingFileSave,
    moralisFile: dataFileSave,
    saveFile,
  } = useMoralisFile();

  useEffect(async () => {
    if (dataFileSave && !loadingFileSave) {
      await doCfHashData(); // get the hash of the file
    }
  }, [dataFileSave, errFileSave, loadingFileSave]);

  useEffect(async () => {
    // if 1st time, then these vars come as []
    if (!Array.isArray(dataCfHashData)) {
      const {dataHash} = dataCfHashData;

      if (dataHash) {
        // create the datapack object
        const newDataPack = {...dataTemplates.dataPack, 
          dataPreview: sellerDataPreview,
          sellerEthAddress: user.get('ethAddress'),
          dataHash,
          dataFile: dataFileSave        
        };
    
        console.log(newDataPack);

        await saveDataPack(newDataPack);

        if (!errDataPackSave) {
          toast({
            title: "Data sent for sale",
            status: "success",
            duration: 4000,
            isClosable: true,
          });

          setSellerDataPreview(''); 
        }
      }
    }

    if (errCfHashData) { // there was an error
      console.error('errCfHashData', errCfHashData);
    }

  }, [dataCfHashData, errCfHashData]);

  const sellOrderSubmit = async () => {
    if (!sellerDataPreview || sellerDataPreview === '') {
      alert('You need to provide some dataPreview!')
    } else {

      try {
        JSON.parse(sellerData); // valid JSON check?
        console.log('🚀 ~ sellOrderSubmit ~ sellerData', sellerData);

        /*
          1) Save the file and get a Moralis
          2) Get a sha256 hash for the data
          3) Save the Data Pack
        */

        await saveFile("sellerDatafile.json", {base64 : btoa(sellerData)});

        return;
      } catch(e) {
        alert('You need to provide some valid JSON for data!');
        return;
      }      
    }
  }

  return (
    <Stack spacing={5}>
      <Box></Box>
      {errDataPackSave && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            {errDataPackSave.message && <AlertTitle>{errDataPackSave.message}</AlertTitle>}
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }
      {errCfHashData && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            {errCfHashData.message && <AlertTitle>{errCfHashData.message}</AlertTitle>}
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }
      {errFileSave && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            {errFileSave.message && <AlertTitle>{errFileSave.message}</AlertTitle>}
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }
      <Heading size="sml">Sell Data</Heading>
      <Input isDisabled placeholder="Seller Eth Address" value={sellerEthAddress} onChange={(event) => setSellerEthAddress(event.currentTarget.value)} />
      <Input placeholder="Data Preview" value={sellerDataPreview} onChange={(event) => setSellerDataPreview(event.currentTarget.value)} />
      <Input placeholder="Data" value={sellerData} onChange={(event) => setSellerData(event.currentTarget.value)} />
      <p>{`{"foo": "bar"}`}</p>
      <Button isLoading={(loadingFileSave || loadingCfHashData || isSaving)} onClick={() => sellOrderSubmit(sellerEthAddress, sellerDataPreview)}>Place for Sale</Button>
    </Stack>
  );
};
