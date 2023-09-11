import { useState, ChangeEvent, FormEvent } from "react";
import { IProfile } from "../models/types"
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody } from '@chakra-ui/react'
import { Input, ModalFooter, ModalCloseButton, SimpleGrid, GridItem } from "@chakra-ui/react";
import { chakra, FormLabel, Stack, FormControl, Textarea, Button } from "@chakra-ui/react";
import { Flex, FormHelperText, Icon, VisuallyHidden, Text, Box } from "@chakra-ui/react";
import { InputGroup, InputLeftAddon } from "@chakra-ui/react";
import { firestore, storage } from "../libs/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useAuth } from "../hooks/useAuth";
import { v4 as uuidv4 } from 'uuid';

type CreateProps = {
    user?: IProfile | undefined,
    isOpen: boolean,
    onClose: () => void
}

export const Create = ({ isOpen, onClose }: CreateProps) => {
    const projectId = uuidv4();
    const { user } = useAuth()
    const [file, setFile] = useState<File | null>(null)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            console.log(file);
            setFile(file)
        }
    };

    const uploadPhoto = async (photoFile: File) => {
        const storageRef = ref(storage, `projects/${projectId}`);
        await uploadBytes(storageRef, photoFile);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            console.log(file);
            setFile(file)
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
            name: { value: string };
            about: { value: string };
            url: { value: string };
        };

        const { name, about, url } = target;

        if (user) {
            const projectRef = doc(firestore, "projects", projectId);
            const updateData: { [key: string]: string | never[] } = {
                likes: [],
                dislikes: []
            };

            if (name?.value) {
                updateData["name"] = name.value;
            }

            if (about?.value) {
                updateData["about"] = about.value;
            }

            if (url?.value) {
                updateData["url"] = url.value;
            }

            if (user) {
                updateData["admin"] = user.id;
            }

            if (file) {
                updateData["photo"] = await uploadPhoto(file);
            }

            await setDoc(projectRef, updateData);
            onClose()
        }
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg="primary" mx={3}>
                    <ModalHeader>Create Post</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <chakra.form
                            method="POST"
                            shadow="base"
                            overflow={{
                                sm: "hidden",
                            }}
                            onSubmit={handleSubmit}
                        >
                            <Stack
                                spacing={6}
                            >
                                <SimpleGrid columns={3} spacing={6}>
                                    <FormControl as={GridItem} colSpan={[3, 2]}>
                                        <FormLabel
                                            fontSize="sm"
                                            fontWeight="md"
                                            color="gray.50"
                                        >
                                            Name
                                        </FormLabel>
                                        <Input
                                            type="text"
                                            name="name"
                                            placeholder='Example'
                                            focusBorderColor="brand"
                                            _placeholder={{ color: "gray.400" }}
                                            rounded="md"
                                        />
                                    </FormControl>
                                </SimpleGrid>
                                <div>
                                    <FormControl id="email" mt={1}>
                                        <FormLabel
                                            fontSize="sm"
                                            fontWeight="md"
                                            color="gray.50"
                                        >
                                            About
                                        </FormLabel>
                                        <Textarea
                                            placeholder={'you@example.com'}
                                            name="about"
                                            mt={1}
                                            rows={3}
                                            shadow="sm"
                                            _placeholder={{ color: "gray.400" }}
                                            focusBorderColor="brand"
                                            fontSize={{
                                                sm: "sm",
                                            }}
                                        />
                                        <FormHelperText>
                                            Brief description for your project.
                                        </FormHelperText>
                                    </FormControl>
                                </div>
                                <FormControl as={GridItem}>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="md"
                                        color="gray.700"
                                        _dark={{
                                            color: "gray.50",
                                        }}
                                    >
                                        URL
                                    </FormLabel>
                                    <InputGroup size="sm">
                                        <InputLeftAddon
                                            bg="gray.50"
                                            _dark={{
                                                bg: "gray.800",
                                            }}
                                            color="gray.500"
                                            rounded="md"
                                        >
                                            http://
                                        </InputLeftAddon>
                                        <Input
                                            type="url"
                                            placeholder="www.example.com"
                                            rounded="md"
                                            name="url"
                                        />
                                    </InputGroup>
                                </FormControl>
                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="md"
                                        color="gray.50"
                                    >
                                        Cover photo
                                    </FormLabel>
                                    <Flex
                                        mt={1}
                                        justify="center"
                                        px={6}
                                        pt={5}
                                        pb={6}
                                        borderWidth={2}
                                        _dark={{
                                            color: "gray.500",
                                        }}
                                        borderStyle="dashed"
                                        rounded="md"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('cover-upload')?.click()}
                                    >
                                        <Stack spacing={1} textAlign="center">
                                            <Icon
                                                mx="auto"
                                                boxSize={12}
                                                color="gray.500"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </Icon>
                                            <Flex
                                                fontSize="sm"
                                                color="gray.400"
                                                alignItems="baseline"
                                            >
                                                <chakra.label
                                                    htmlFor="file-upload"
                                                    cursor="pointer"
                                                    rounded="md"
                                                    fontSize="md"
                                                    color="brand.200"
                                                    pos="relative"
                                                    _hover={{
                                                        color: "brand.300",
                                                    }}
                                                >
                                                    <span>Upload a file</span>
                                                    <VisuallyHidden>
                                                        <input
                                                            id="cover-upload"
                                                            name="cover-upload"
                                                            type="file"
                                                            onChange={handleChange}
                                                        />
                                                    </VisuallyHidden>
                                                </chakra.label>
                                                <Text pl={1}>or drag and drop</Text>
                                            </Flex>
                                            <Text
                                                fontSize="xs"
                                                color="gray.50"
                                            >
                                                PNG, JPG, GIF up to 10MB
                                            </Text>
                                        </Stack>
                                    </Flex>
                                </FormControl>
                            </Stack>
                            <Box
                                px={{
                                    base: 4,
                                    sm: 6,
                                }}
                                py={3}
                                bg="gray.50"
                                _dark={{
                                    bg: "#121212",
                                }}
                                textAlign="right"
                            >
                                <Button
                                    type="submit"
                                    bg="brand"
                                    _hover={{ bg: "brandHover" }}
                                    fontWeight="md"
                                >
                                    Save
                                </Button>
                            </Box>
                        </chakra.form>
                    </ModalBody>
                    <ModalFooter>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
