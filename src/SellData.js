import { useState } from 'react';
import { useMoralis, useNewMoralisObject } from 'react-moralis';
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
  const toast = useToast()
  const { isSaving, error: errorDataPackSave, save: saveDataPack } = useNewMoralisObject('DataPack');
  const [sellerEthAddress, setSellerEthAddress] = useState(user.get('ethAddress'));
  const [sellerData, setSellerData] = useState('');

  const sellOrderSubmit = async () => {
    if (!sellerData || sellerData === '') {
      alert('You need to provide some dataPreview!')
    } else {
      // create the object
      const newDataPack = {...dataTemplates.dataPack, 
        dataPreview: sellerData,
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

        setSellerData(''); 
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
      <Input placeholder="Data Preview" value={sellerData} onChange={(event) => setSellerData(event.currentTarget.value)} />
      <Button isLoading={isSaving} onClick={() => sellOrderSubmit(sellerEthAddress, sellerData)}>Place for Sale</Button>
    </Stack>
  );
};
