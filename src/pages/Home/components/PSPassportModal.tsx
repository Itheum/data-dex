import React, { useState } from "react";
import { Button, IconButton } from "@chakra-ui/button";
import { Checkbox } from "@chakra-ui/checkbox";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { Input } from "@chakra-ui/input";
import { Heading, Stack, HStack, Spacer, Flex, Badge, Box } from "@chakra-ui/layout";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/modal";
import { Progress } from "@chakra-ui/progress";
import { Image, Text, useBreakpointValue, useColorMode } from "@chakra-ui/react";
import { ScaleFade } from "@chakra-ui/transition";
import { useNavigate } from "react-router";
import AstarIcon from "assets/img/astar-icon.png";
import ItheumIcon from "assets/img/logo-sml-d.png";
import ItheumIcon2 from "assets/img/logo-sml-l.png";
import MXIcon from "assets/img/mx-logo.png";
import zedgeLogo from "assets/img/zedge-logo.png";
import { sleep } from "libs/utils";

type MarshalFeatures = {
  [index: string]: any;
};

const marshalFeatures: MarshalFeatures = {
  "Itheum Achilles": {
    "location": "Germany",
    "maxStream": "4.5MB",
    "supportsPagination": "No",
    "optimisticDataRollups": "No",
  },
  "Itheum Brontes": {
    "location": "Germany",
    "maxStream": "50MB",
    "supportsPagination": "Yes",
    "optimisticDataRollups": "Yes",
  },
};

const cleanSaveProgress = {
  s0: 0,
  s1: 0,
  s2: 0,
  s3: 0,
  s4: 0,
};

const cleanDataStreamGenProgress = {
  g0: 0,
  g1: 0,
  g2: 0,
  g3: 0,
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  setMenuItem: any;
};

const PSPassportModal: React.FC<Props> = (props) => {
  const { isOpen, onClose, setMenuItem } = props;
  const modelSize = useBreakpointValue({ base: "xs", md: "xl" });
  const { colorMode } = useColorMode();

  const [readTermsChecked, setReadTermsChecked] = useState(false);
  const [joinProgress, setJoinProgress] = useState({ ...cleanSaveProgress, s0: 1 });
  const [PSNCheckInProgress, setPSNCheckInProgress] = useState(false);
  const [psnUserDataStream, setPsnUserDataStream] = useState<null | string>(null);
  const [datastoreLocation, setDatastoreLocation] = useState("North America");
  const [dataMarshalService, setDataMarshalService] = useState("Itheum Achilles");
  const [dataStreamSetupProgress, setDataStreamSetupProgress] = useState<boolean>(true);
  const [npsso, setNpsso] = useState("");
  const [PSNUsername, setPSNUsername] = useState("");
  const [PSNValid, setPSNValid] = useState<null | string>(null);
  const [PSNUsernameValid, setPSNUsernameValid] = useState<null | string>(null);
  const [dataStreamGenProgress, setDataStreamGenProgress] = useState({ ...cleanDataStreamGenProgress });
  const [PSNFullCheckError, setPSNFullCheckError] = useState<null | string>(null);

  const navigate = useNavigate();

  const dataStreamGeneration = async () => {
    setDataStreamSetupProgress(true);

    await sleep(2);
    setDataStreamGenProgress(() => ({ ...cleanDataStreamGenProgress, g1: 1 }));
    await sleep(2);
    setDataStreamGenProgress(() => ({ ...cleanDataStreamGenProgress, g2: 1 }));
    await sleep(2);
    setDataStreamGenProgress(() => ({ ...cleanDataStreamGenProgress, g3: 1 }));
    await sleep(2);

    setDataStreamSetupProgress(false);
  };

  const verifyAndGeneratePSNDataStream = async () => {
    setPSNFullCheckError(null);

    if (npsso.trim().length <= 5) {
      setPSNValid("Your NPSSO length needs to be more than 5 characters");
      return;
    }

    if (PSNUsername.trim().length <= 5) {
      setPSNUsernameValid("Your PlayStation Username length needs to be more than 5 characters");
      return;
    }

    setPSNCheckInProgress(true);

    const psnDataStream = `https://psn-api-pers-production.up.railway.app/initSession?npsso=${npsso.trim()}`;

    fetch(psnDataStream, { method: "GET" })
      .then((resp) => resp.json())
      .then((res) => {
        if (typeof res.id !== "undefined") {
          setPSNCheckInProgress(false);
          setPsnUserDataStream(`https://psn-api-pers-production.up.railway.app/getData?id=${res.id}&user=${PSNUsername}`);
          setPSNValid(null);
          setPSNUsernameValid(null);
        } else {
          console.log("ERROR ********");
          setPSNFullCheckError("NPSSO and PSN Username check has failed. Please enter a valid details.");
          setPSNCheckInProgress(false);
        }
      });
  };

  return (
    <Modal size={modelSize} isOpen={isOpen} onClose={onClose} closeOnEsc={false} closeOnOverlayClick={false}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
          <Heading size="md" fontFamily="Satoshi-Medium" opacity=".5">
            Bridge your Data to Web3!
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
          {(joinProgress.s0 && (
            <Stack spacing="5">
              <Heading size={{ base: "md", md: "lg" }} fontFamily="Clash-Medium">
                Sony PlayStation Gamer Passport
              </Heading>
              <HStack spacing="5">
                <Text>
                  Unlock a live dataset of a Sony PlayStation {`gamer's`} platform, preferences, active titles played, trophies, playtime, and achievements. All
                  sourced direct from the gamer!
                </Text>
              </HStack>

              <Spacer></Spacer>

              <Flex flexDirection={{ base: "column", md: "row" }} justifyContent="space-between" textAlign="center">
                <Box>
                  <Heading size="md" mb="2px" fontFamily="Clash-Regular" color="teal.200">
                    App Publisher
                  </Heading>
                  <Image opacity=".8" mt="5px" display="initial" borderRadius="5px" width="130px" src={zedgeLogo} />
                </Box>
                <Box>
                  <Heading size="md" mb="2px" fontFamily="Clash-Regular" color="teal.200">
                    Rating
                  </Heading>
                  <Text mt={{ base: "10px", md: "30px" }} mb={{ base: "10px", md: "0px" }}>
                    4 / 5
                  </Text>
                </Box>
                <Box>
                  <Heading size="md" mb="2px" fontFamily="Clash-Regular" color="teal.200">
                    Users
                  </Heading>
                  <Text mt={{ base: "10px", md: "30px" }} mb={{ base: "10px", md: "0px" }}>
                    10
                  </Text>
                </Box>
                <Box>
                  <Heading size="md" mb="2px" fontFamily="Clash-Regular" color="teal.200">
                    Verified App
                  </Heading>
                  <Text mt={{ base: "10px", md: "30px" }} mb={{ base: "10px", md: "0px" }}>
                    No
                  </Text>
                </Box>
              </Flex>

              <Box>
                <Flex mt="4 !important">
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    size={{ base: "sm", md: "sm" }}
                    fontSize={{ base: "9px !important", md: "md" }}
                    onClick={() => window.open("https://itheum.com/legal/termsofuse")}>
                    Read Terms of Use
                  </Button>
                  <Checkbox size="sm" ml="15px" isChecked={readTermsChecked} onChange={(e) => setReadTermsChecked(e.target.checked)}>
                    I have read all terms and agree to them
                  </Checkbox>
                </Flex>
              </Box>

              <Flex justifyContent="end" mt="8 !important">
                <Button mx="3" colorScheme="teal" size="sm" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="teal"
                  size="sm"
                  isDisabled={!readTermsChecked}
                  onClick={() => {
                    setJoinProgress(() => ({ ...cleanSaveProgress, s1: 1 }));
                  }}>
                  Get Started
                </Button>
              </Flex>
            </Stack>
          )) ||
            null}

          {(joinProgress.s1 && (
            <Box>
              <Heading size="md" fontFamily="Satoshi-Medium">
                Step 1 of 4
              </Heading>
              <Heading size="lg" fontFamily="Clash-Medium" mt="10px">
                Link your PlayStation Account
              </Heading>

              <HStack mt="40px">
                <Text w="150px">Your NPSSO</Text>
                <Input
                  isInvalid={PSNValid !== null}
                  errorBorderColor="red.300"
                  value={npsso}
                  onChange={(event) => setNpsso(event.target.value)}
                  w="300px"
                  placeholder="Your PlayStation Network (PSN) NPSSO"
                />
              </HStack>
              {PSNValid && (
                <Text ml="100px" mt="5px" color="red.300" fontSize="sm">
                  {PSNValid}
                </Text>
              )}

              <HStack mt="10px">
                <Text w="150px">Your PSN Username</Text>
                <Input
                  isInvalid={PSNUsernameValid !== null}
                  errorBorderColor="red.300"
                  value={PSNUsername}
                  onChange={(event) => setPSNUsername(event.target.value)}
                  w="300px"
                  placeholder="Your PlayStation Network (PSN) Username"
                />
              </HStack>
              {PSNUsernameValid && (
                <Text ml="100px" mt="5px" color="red.300" fontSize="sm">
                  {PSNUsernameValid}
                </Text>
              )}

              <Box mt="20px">
                <Button isDisabled={PSNUsername.length <= 5 || npsso.length <= 5} onClick={verifyAndGeneratePSNDataStream}>
                  Verify NPSSO and PSN Username
                </Button>
                {PSNFullCheckError && (
                  <Text mt="10px" color="red.300" fontSize="sm">
                    {PSNFullCheckError}
                  </Text>
                )}
              </Box>

              <Box height="30px" mt="20px">
                {(PSNCheckInProgress && (
                  <Box>
                    <Text fontSize="lg" mb="2">
                      Verifying NPSSO with PSN Network...
                    </Text>
                    <Progress colorScheme="teal" size="xs" isIndeterminate />
                  </Box>
                )) || (
                  <>
                    {psnUserDataStream && !PSNFullCheckError && (
                      <Text mt="10px" fontSize="sm">
                        Verified... proceed to Next Step
                      </Text>
                    )}
                  </>
                )}
              </Box>

              <Flex justifyContent="end" mt="20 !important">
                <Button
                  mx="3"
                  colorScheme="grey"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPSNCheckInProgress(false);
                    setPsnUserDataStream(`https://api.itheumcloud-stg.com/hosteddataassets/playstation_gamer_1_data_passport.json#f=${Date.now()}`);
                    setPSNValid(null);
                    setPSNUsernameValid(null);
                    setJoinProgress(() => ({ ...cleanSaveProgress, s2: 1 }));
                  }}>
                  Test it
                </Button>
                <Spacer />
                <Button mx="3" colorScheme="teal" size="sm" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="teal"
                  size="sm"
                  isDisabled={psnUserDataStream === null}
                  onClick={() => {
                    setJoinProgress(() => ({ ...cleanSaveProgress, s2: 1 }));
                  }}>
                  Next Step
                </Button>
              </Flex>
            </Box>
          )) ||
            null}

          {(joinProgress.s2 && (
            <Box>
              <Heading size="md" fontFamily="Satoshi-Medium">
                Step 2 of 4
              </Heading>
              <Heading size="lg" fontFamily="Clash-Medium" mt="10px">
                Choose your Data Sovereignty Preferences
              </Heading>

              <HStack mt="20px">
                <Text>Select a jurisdiction where you would you like your de-identified PlayStation Data Stream origin data to be stored at:</Text>
              </HStack>

              <HStack mt="20px" flexWrap="wrap" gap={3}>
                <IconButton
                  aria-label="Germany"
                  variant="outline"
                  colorScheme="teal"
                  isActive={datastoreLocation === "North America"}
                  size="lg"
                  marginInlineStart="0px !important"
                  padding="5px"
                  onClick={() => setDatastoreLocation("North America")}
                  icon={<Image borderRadius="1px" height="30px" alt="United States" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/US.svg" />}
                />
                <IconButton
                  aria-label="Germany"
                  variant="outline"
                  colorScheme="teal"
                  isActive={datastoreLocation === "Germany"}
                  size="lg"
                  marginInlineStart="0px !important"
                  padding="5px"
                  onClick={() => setDatastoreLocation("Germany")}
                  isDisabled={true}
                  icon={<Image borderRadius="1px" height="30px" alt="Germany" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/DE.svg" />}
                />
                <IconButton
                  aria-label="Japan"
                  variant="outline"
                  colorScheme="teal"
                  isActive={datastoreLocation === "Japan"}
                  size="lg"
                  marginInlineStart="0px !important"
                  padding="5px"
                  onClick={() => setDatastoreLocation("Japan")}
                  isDisabled={true}
                  icon={
                    <Image borderRadius="1px" height="30px" alt="Japan" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/JP.svg" />
                  }></IconButton>
                <IconButton
                  aria-label="Hong Kong"
                  variant="outline"
                  colorScheme="teal"
                  isActive={datastoreLocation === "Hong Kong"}
                  size="lg"
                  marginInlineStart="0px !important"
                  padding="5px"
                  onClick={() => setDatastoreLocation("Hong Kong")}
                  isDisabled={true}
                  icon={<Image borderRadius="1px" height="30px" alt="Hong Kong" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/HK.svg" />}
                />
                <IconButton
                  aria-label="Australia"
                  variant="outline"
                  colorScheme="teal"
                  isActive={datastoreLocation === "Australia"}
                  size="lg"
                  marginInlineStart="0px !important"
                  padding="5px"
                  onClick={() => setDatastoreLocation("Australia")}
                  isDisabled={true}
                  icon={<Image borderRadius="1px" height="30px" alt="Australia" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/AU.svg" />}
                />
                <IconButton
                  aria-label="Singapore"
                  variant="outline"
                  colorScheme="teal"
                  isActive={datastoreLocation === "Singapore"}
                  size="lg"
                  marginInlineStart="0px !important"
                  padding="5px"
                  onClick={() => setDatastoreLocation("Singapore")}
                  isDisabled={true}
                  icon={<Image borderRadius="1px" height="30px" alt="Singapore" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/SG.svg" />}
                />
              </HStack>

              {datastoreLocation && (
                <Text mt="5px" color="teal.200">
                  Selected Region: {datastoreLocation}
                </Text>
              )}

              <Flex justifyContent="end" mt="20 !important">
                <Button colorScheme="teal" size="sm" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="teal"
                  variant="outline"
                  size="sm"
                  mx="3"
                  onClick={() => {
                    setJoinProgress(() => ({ ...cleanSaveProgress, s1: 1 }));
                  }}>
                  Previous Step
                </Button>

                <Button
                  colorScheme="teal"
                  size="sm"
                  onClick={() => {
                    setJoinProgress(() => ({ ...cleanSaveProgress, s3: 1 }));
                  }}>
                  Next Step
                </Button>
              </Flex>
            </Box>
          )) ||
            null}

          {(joinProgress.s3 && (
            <Box>
              <Heading size="md" fontFamily="Satoshi-Medium">
                Step 3 of 4
              </Heading>
              <Heading size="lg" fontFamily="Clash-Medium" mt="10px">
                Pick your preferred Data Marshal
              </Heading>

              <HStack mt="20px">
                <Text>Data Marshals are nodes that broker the trade of data, anyone can launch a Data Marshal and join the brokerage network.</Text>
              </HStack>

              <HStack mt="20px">
                <IconButton
                  aria-label="Itheum Achilles"
                  variant="outline"
                  colorScheme="teal"
                  isActive={dataMarshalService === "Itheum Achilles"}
                  size="lg"
                  padding="5px"
                  onClick={() => setDataMarshalService("Itheum Achilles")}
                  icon={<Image borderRadius="1px" height="30px" alt="Itheum" src={ItheumIcon} />}></IconButton>
                <IconButton
                  aria-label="Itheum Brontes"
                  variant="outline"
                  colorScheme="teal"
                  isActive={dataMarshalService === "Itheum Brontes"}
                  size="lg"
                  padding="5px"
                  onClick={() => setDataMarshalService("Itheum Brontes")}
                  icon={<Image borderRadius="1px" height="30px" alt="Itheum" src={ItheumIcon2} />}></IconButton>
                <IconButton
                  aria-label="MultiversX"
                  variant="outline"
                  colorScheme="teal"
                  isDisabled={true}
                  isActive={dataMarshalService === "MultiversX"}
                  size="lg"
                  padding="5px"
                  onClick={() => setDataMarshalService("MultiversX")}
                  icon={<Image borderRadius="1px" height="30px" alt="Astar" src={MXIcon} />}
                />
                <IconButton
                  aria-label="Astar"
                  variant="outline"
                  colorScheme="teal"
                  isDisabled={true}
                  isActive={dataMarshalService === "Astar"}
                  size="lg"
                  padding="5px"
                  onClick={() => setDataMarshalService("Astar")}
                  icon={<Image borderRadius="1px" height="30px" alt="Astar" src={AstarIcon} />}
                />
              </HStack>

              {datastoreLocation && (
                <>
                  <Text mt="10px" color="teal.200">
                    Selected Data Marshal Client: {dataMarshalService}
                  </Text>

                  <Box fontSize="sm">
                    <Text>Node Location: {marshalFeatures[dataMarshalService].location}</Text>
                    <Text>Max Stream Size: {marshalFeatures[dataMarshalService].maxStream}</Text>
                    <Text>Supports Pagination: {marshalFeatures[dataMarshalService].supportsPagination}</Text>
                    <Text>Supports Optimistic Data Rollups: {marshalFeatures[dataMarshalService].optimisticDataRollups}</Text>
                  </Box>
                </>
              )}

              <Flex justifyContent="end" mt="20 !important">
                <Button colorScheme="teal" size="sm" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="teal"
                  variant="outline"
                  size="sm"
                  mx="3"
                  onClick={() => {
                    setJoinProgress(() => ({ ...cleanSaveProgress, s2: 1 }));
                  }}>
                  Previous Step
                </Button>

                <Button
                  colorScheme="teal"
                  size="sm"
                  onClick={() => {
                    setJoinProgress(() => ({ ...cleanSaveProgress, s4: 1 }));
                    setDataStreamGenProgress(() => ({ ...cleanDataStreamGenProgress, g0: 1 }));
                    dataStreamGeneration();
                  }}>
                  Next Step
                </Button>
              </Flex>
            </Box>
          )) ||
            null}

          {(joinProgress.s4 && (
            <Box>
              <Heading size="md" fontFamily="Satoshi-Medium">
                Final Step
              </Heading>
              <Heading size="lg" fontFamily="Clash-Medium" mt="10px">
                Building your Data Stream...
              </Heading>

              <Box mt="40px" pb="40px">
                {(dataStreamSetupProgress && (
                  <Box>
                    {Boolean(dataStreamGenProgress.g0) && (
                      <Text fontSize="lg" mb="2">
                        Fetching your gamer baseline data from the PlayStation Network...
                      </Text>
                    )}
                    {Boolean(dataStreamGenProgress.g1) && (
                      <Text fontSize="lg" mb="2">
                        De-identifying your data...
                      </Text>
                    )}
                    {Boolean(dataStreamGenProgress.g2) && (
                      <Text fontSize="lg" mb="2">
                        Moving the origin data for regional sovereignty based storage in{" "}
                        <Badge borderRadius="sm" px="2" py="0.08rem" colorScheme="teal">
                          {datastoreLocation}
                        </Badge>
                      </Text>
                    )}
                    {Boolean(dataStreamGenProgress.g3) && (
                      <Text fontSize="lg" mb="2">
                        Finalizing your Data Stream for Data NFT Minting...
                      </Text>
                    )}
                    <Progress colorScheme="teal" size="xs" isIndeterminate />
                  </Box>
                )) || (
                  <ScaleFade initialScale={0.9} in={!dataStreamSetupProgress}>
                    <Flex justifyContent="center" alignItems="center" mt="8 !important">
                      <CheckCircleIcon w={20} h={20} color="teal.200" />
                      <Text fontSize="lg" ml="2">
                        Your Data Stream is ready!
                      </Text>
                    </Flex>
                  </ScaleFade>
                )}
              </Box>

              {!dataStreamSetupProgress && (
                <Flex justifyContent="center" mt="8 !important">
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    isDisabled={dataStreamSetupProgress}
                    mr="10px"
                    onClick={() => {
                      if (psnUserDataStream) {
                        window.open(psnUserDataStream);
                      }
                    }}>
                    Preview Data Stream
                  </Button>
                  <Button
                    colorScheme="teal"
                    isDisabled={dataStreamSetupProgress}
                    onClick={() => {
                      if (psnUserDataStream) {
                        onClose();
                        setJoinProgress(() => ({ ...cleanSaveProgress }));
                        setDataStreamGenProgress(() => ({ ...cleanDataStreamGenProgress }));
                        setMenuItem(2);
                        navigate(`/mintdata?loadDrawer=1&skipPreview=1&dm=${dataMarshalService}&ds=${encodeURIComponent(psnUserDataStream)}`);
                      }
                    }}>
                    Mint my Data NFT
                  </Button>
                </Flex>
              )}
            </Box>
          )) ||
            null}
        </ModalBody>
        <ModalFooter bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
          <Text display="none">{JSON.stringify(joinProgress)}</Text>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PSPassportModal;
