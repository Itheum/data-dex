import React, { useState } from "react";
import {
  Button,
  Spacer,
  Text,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogBody,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Alert,
} from "@chakra-ui/react";

const AlertOverlay = ({ errorData: { errContextMsg, rawError }, onClose }) => {
  const [isAlertOpen, setAlertIsOpen] = useState(true);
  const errorToShow = rawError.message ? rawError.message : rawError;

  return (
    <AlertDialog isOpen={isAlertOpen} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogBody>
            <Alert status="error" display="flex" flexDirection="column" textAlign="center" m="1" borderRadius="md">
              <AlertIcon />
              <AlertTitle>There was an error!</AlertTitle>
              <AlertDescription>
                <Text>{errContextMsg}</Text>
                <Spacer mt="2" />
                <Text as="b">{errorToShow}</Text>
              </AlertDescription>
              <Button
                mt="5"
                onClick={() => {
                  setAlertIsOpen(false);
                }}>
                Close
              </Button>
            </Alert>
          </AlertDialogBody>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default AlertOverlay;
