import React from "react";
import { Button } from "@chakra-ui/button";
import { Stack } from "@chakra-ui/layout";
import {
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useBreakpointValue,
  useColorMode,
} from "@chakra-ui/react";
import { progInfoMeta } from "libs/config";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  learnMoreProd: keyof typeof progInfoMeta;
};

const LearnMoreModal: React.FC<Props> = (props) => {
  const { isOpen, onClose, learnMoreProd } = props;
  const modelSize = useBreakpointValue({ base: "xs", md: "xl" });
  const { colorMode } = useColorMode();
  return (
    <Modal size={modelSize} isOpen={isOpen && !!learnMoreProd} onClose={onClose} closeOnEsc={false} closeOnOverlayClick={false}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>{progInfoMeta[learnMoreProd].name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
          <Stack spacing="5">
            <Text>{progInfoMeta[learnMoreProd].desc}</Text>
            {progInfoMeta[learnMoreProd].medium !== null && (
              <Stack>
                <Text color="gray" as="b">
                  Delivered Via:
                </Text>{" "}
                <p>{progInfoMeta[learnMoreProd].medium}</p>
              </Stack>
            )}
            <Stack>
              <Text color="gray" as="b">
                Data Collected:
              </Text>{" "}
              <p>{progInfoMeta[learnMoreProd].data}</p>
            </Stack>
            <Stack>
              <Text color="gray" as="b">
                App Outcome:
              </Text>{" "}
              <p>{progInfoMeta[learnMoreProd].outcome}</p>
            </Stack>
            <Stack>
              <Text color="gray" as="b">
                Target Buyers:
              </Text>{" "}
              <p>{progInfoMeta[learnMoreProd].targetBuyer}</p>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
          <Button size="sm" mr={3} colorScheme="teal" variant="outline" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LearnMoreModal;
