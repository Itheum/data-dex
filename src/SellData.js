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

const templates = {
  dataOrder: {
    state: '1',
    sellerEthAddress: null,
    data: null
  }
}

export default function() {
  const { user } = useMoralis();
  const toast = useToast()
  const { isSaving, error: errorDataOrderSave, save: saveDataOrder } = useNewMoralisObject('DataOrder');
  const [sellerEthAddress, setSellerEthAddress] = useState(user.get('ethAddress'));
  const [sellerData, setSellerData] = useState('');

  // const isSaving = false;
  // const error = true;

  const sellOrderSubmit = async () => {
    if (!sellerData || sellerData === '') {
      alert('You need to provide some data!')
    } else {
      // create the object
      const newDataOrder = {...templates.dataOrder, 
        data: sellerData,
        sellerEthAddress: user.get('ethAddress')
      };
  
      console.log('🚀 ~ sellOrderSubmit ~ newDataOrder', newDataOrder);
  
      await saveDataOrder(newDataOrder);

      if (!errorDataOrderSave) {
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
      {errorDataOrderSave && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{errorDataOrderSave.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }
      <Heading size="sml">Sell Data</Heading>
      <Input isDisabled placeholder="Seller Eth Address" value={sellerEthAddress} onChange={(event) => setSellerEthAddress(event.currentTarget.value)} />
      <Input placeholder="Data" value={sellerData} onChange={(event) => setSellerData(event.currentTarget.value)} />
      <Button isLoading={isSaving} onClick={() => sellOrderSubmit(sellerEthAddress, sellerData)}>Save</Button>
    </Stack>
  );
};
