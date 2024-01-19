import React, { useEffect } from "react";
import { Box, Text, Link, Flex, Button, useDisclosure, Modal, ModalBody, ModalContent, ModalOverlay, UnorderedList, ListItem, Heading } from "@chakra-ui/react";
import { useLocalStorage } from "libs/hooks";

const NONE = "none";
function convertDateToDays(time: Date): number {
  return Math.floor((time.getTime() - time.getTimezoneOffset() * 60 * 1000) / (1000 * 3600 * 24));
}

function PrintNoticeList() {
  const listString = import.meta.env.VITE_TERMS_CHANGED_NOTICE_SECTIONS_CHANGED;
  const listItems: string[] = listString ? listString.split(",").filter((row: any) => !!row) : [];
  return <UnorderedList mb="3">{listItems.length > 0 && listItems.map((row, index) => <ListItem key={index}>{row}</ListItem>)}</UnorderedList>;
}

export function TermsChangedNoticeModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [noticeTimeString, setNoticeTimeString] = useLocalStorage("terms-changed-notice-timestamp", NONE);

  useEffect(() => {
    const startTimeString = import.meta.env.VITE_TERMS_CHANGED_NOTICE_START_TIMESTAMP;
    const endTimeString = import.meta.env.VITE_TERMS_CHANGED_NOTICE_END_TIMESTAMP;

    if (startTimeString && endTimeString) {
      try {
        const startTimeDays = convertDateToDays(new Date(startTimeString));
        const endTimeDays = convertDateToDays(new Date(endTimeString));
        const currentTimeDays = convertDateToDays(new Date());

        if (startTimeDays <= currentTimeDays && currentTimeDays <= endTimeDays) {
          if (!noticeTimeString) return; // ignore null value
          if (noticeTimeString != NONE) {
            const oldNoticeTimeDays = convertDateToDays(new Date(noticeTimeString));
            if (oldNoticeTimeDays >= endTimeDays) return; // user already checked notice
          }

          onOpen(); // open the modal
        }
      } catch {
        /* empty */
      }
    }
  }, [noticeTimeString]);

  function onContinue() {
    const endTimeString = import.meta.env.VITE_TERMS_CHANGED_NOTICE_END_TIMESTAMP;
    setNoticeTimeString(endTimeString);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnEsc={false} closeOnOverlayClick={false}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalBody py={6}>
          <Heading size="lg">We&lsquo;ve Updated Our Terms and Policies</Heading>
          <Box fontSize="sm" mt="3">
            <Text mb="2">We want you to know that we have made updates to our Terms of Use. The updated terms are for: </Text>
            <PrintNoticeList />

            <Text mb="2">
              Updates are viewable here :{" "}
              <Link href="https://itheum.com/legal/datadex/termsofuse" isExternal textDecoration="underline">
                https://itheum.com/legal/datadex/termsofuse
              </Link>
            </Text>
            <Text mb="2">We encourage you to review all the updated terms that apply to you.</Text>
            <Text mb="2">Your continued use of our Website and App is an agreement to these updated Terms and Policies.</Text>
          </Box>

          <Flex justifyContent="end" mt="4 !important">
            <Button colorScheme="teal" size="sm" mx="3" onClick={onContinue}>
              Continue
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
