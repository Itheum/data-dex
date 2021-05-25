import { useEffect, useState } from 'react';
import { useMoralis, useNewMoralisObject, useMoralisCloudFunction, useMoralisFile } from 'react-moralis';
import { Heading, Box, Stack } from '@chakra-ui/layout';
import {
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  CloseButton,
  Input,
  useToast
} from '@chakra-ui/react';

import { dataTemplates } from './util';

export default function() {
  const { user } = useMoralis();
  const toast = useToast();
  const [sellerEthAddress, setSellerEthAddress] = useState(user.get('ethAddress'));
  const [sellerDataPreview, setSellerDataPreview] = useState('');
  const [sellerData, setSellerData] = useState('');

  const { isSaving, error: errorDataPackSave, save: saveDataPack } = useNewMoralisObject('DataPack');
  const { fetch: doCfSaveData, data: dataCfSaveData, error: errCfSaveData, isLoading: loadingCfSaveData } = useMoralisCloudFunction(
    "saveSellerDataToFile",
    {
      sellerData
    },
    { autoFetch: false }
  );

  const {
    error,
    isUploading,
    moralisFile,
    saveFile,
  } = useMoralisFile();

  useEffect(async () => {
    console.log('moralisFile');
    console.log(moralisFile);
    console.log('error');
    console.log(error);
    console.log('isUploading');
    console.log(isUploading);

    if (moralisFile && !isUploading) {
      console.log('SAVE HERE....');
      finalSave(moralisFile);
    }
  }, [moralisFile, error, isUploading]);

  const finalSave = async(dataFile) => {
    // create the datapack object
    const newDataPack = {...dataTemplates.dataPack, 
      dataPreview: sellerDataPreview,
      sellerEthAddress: user.get('ethAddress'),
      dataFile
    };

    await saveDataPack(newDataPack);

    toast({
      title: "Data sent for sale",
      status: "success",
      duration: 4000,
      isClosable: true,
    });

    setSellerDataPreview(''); 
  }

  useEffect(async () => {
    // if 1st time, then these vars come as []
    if (!Array.isArray(dataCfSaveData)) {
      console.log('dataCfSaveData', dataCfSaveData);

      const {dataUrl, dataHash} = dataCfSaveData;

      if (dataUrl && dataHash) {
        // create the datapack object
        const newDataPack = {...dataTemplates.dataPack, 
          dataPreview: sellerDataPreview,
          dataUrl,
          dataHash,
          sellerEthAddress: user.get('ethAddress')
        };
    
        await saveDataPack(newDataPack);

        if (!errorDataPackSave) {
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

    if (errCfSaveData) { // there was an error
      console.log('errCfSaveData', errCfSaveData);
    }
  }, [dataCfSaveData, errCfSaveData]);

  const saveRawFile = async (object) => {
    // const sellerDatafile = new Moralis.File("sellerDatafile.json", {base64 : btoa(JSON.stringify(object))});
    // await file.saveIPFS();

    await saveFile("sellerDatafile.json", {base64 : btoa(JSON.stringify(object))});
  }
  
  const sellOrderSubmit = async () => {
    if (!sellerDataPreview || sellerDataPreview === '') {
      alert('You need to provide some dataPreview!')
    } else {
      // take the data and save it as a file using a cloud function
      // ... output will be URL to the file and the hash of the content
      let parsedSellerData = null;

      try {
        parsedSellerData = JSON.parse(sellerData);

        saveRawFile(parsedSellerData);

        // await doCfSaveData();     
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
      {errorDataPackSave && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{errorDataPackSave.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }
      <Heading size="sml">Sell Data</Heading>
      <Input isDisabled placeholder="Seller Eth Address" value={sellerEthAddress} onChange={(event) => setSellerEthAddress(event.currentTarget.value)} />
      <Input placeholder="Data Preview" value={sellerDataPreview} onChange={(event) => setSellerDataPreview(event.currentTarget.value)} />
      <Input placeholder="Data" value={sellerData} onChange={(event) => setSellerData(event.currentTarget.value)} />
      <p>{`{"foo": "bar"}`}</p>
      <Button isLoading={(loadingCfSaveData || isSaving)} onClick={() => sellOrderSubmit(sellerEthAddress, sellerDataPreview)}>Place for Sale</Button>
    </Stack>
  );
};
