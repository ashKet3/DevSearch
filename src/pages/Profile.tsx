import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useParams } from "react-router-dom"
import { firestore, storage } from '../libs/firebase';
import { IProfile, IProject } from '../models/types';
import { doc, getDoc, updateDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Box, chakra, Flex, Icon, Image, Grid, Button } from '@chakra-ui/react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody } from '@chakra-ui/react'
import { IconButton, useDisclosure, ModalCloseButton } from '@chakra-ui/react';
import { Stack, SimpleGrid, FormControl, GridItem, FormLabel, Avatar } from "@chakra-ui/react"
import { Input, Textarea, FormHelperText, Spinner } from "@chakra-ui/react"
import { VisuallyHidden, Text } from '@chakra-ui/react';
import { Interactions } from '../components/Interactions';
import { useFollow } from '../hooks/useFollow';
import { useAuth } from '../hooks/useAuth';
import { FaUser } from 'react-icons/fa';
import { FiMail } from "react-icons/fi"
import { Link } from "react-router-dom"
import { Entry } from '../components/Entry';

export const Profile = () => {
    const { slug } = useParams();
    const [user, setUser] = useState<IProfile | undefined>(undefined)
    const { user: currentUser } = useAuth()
    const { following, followers, followUser, unfollowUser, isFollowing } = useFollow(user)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [photo, setPhoto] = useState<File | null>(null)
    const [cover, setCover] = useState<File | null>(null)
    const [projects, setProjects] = useState<IProject[]>([]);
    const [hasFollow, setHasFollow] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isOpen: hasOpen, onOpen: doOpen, onClose: hasClose } = useDisclosure()

    useEffect(() => {
        async function fetchUserData() {
            if (slug) {
                const docRef = doc(firestore, "users", slug);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const userData: IProfile = {
                        id: docSnap.id,
                        ...docSnap.data()
                    }
                    setUser(userData);
                    setLoading(false);
                } else {
                    console.log("No such user!");
                }
            }
        }

        fetchUserData();
    }, [slug]);

    useEffect(() => {
        const fetchFollowing = async () => {
            if (user && user?.id !== currentUser?.id) {
                const ifFollow = await isFollowing(user?.id)
                setHasFollow(ifFollow)
            }
        }
        fetchFollowing()
    }, [user, isFollowing, currentUser])

    useEffect(() => {
        if (user) {
            const docRef = collection(firestore, "projects");
            const q = query(docRef, where("admin", "==", user?.id));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name,
                    about: doc.data().about,
                    admin: doc.data().admin,
                    photo: doc.data().photo,
                    url: doc.data().url,
                    likes: doc.data().likes,
                    dislikes: doc.data().dislikes
                }));
                setProjects(fetchedData);
            });

            return () => unsubscribe();
        }
    }, [user]);

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            console.log(file);
            setPhoto(file)
        }
    }

    const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            console.log(file);
            setCover(file)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            console.log(file);
            setCover(file)
        }
    };

    const uploadPhoto = async (photoFile: File) => {
        const storageRef = ref(storage, `photos/${currentUser?.id}`);
        await uploadBytes(storageRef, photoFile);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    };

    const uploadCover = async (coverPhotoFile: File) => {
        const storageRef = ref(storage, `cover_photos/${currentUser?.id}`);
        await uploadBytes(storageRef, coverPhotoFile);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
            name: { value: string };
            about: { value: string };
        };

        const { name, about } = target;

        if (currentUser) {
            const userRef = doc(firestore, "users", currentUser?.id);
            const updateData: { [key: string]: string } = {};

            if (name?.value) {
                updateData["name"] = name.value;
            }

            if (about?.value) {
                updateData["about"] = about.value;
            }

            if (photo) {
                updateData["photo"] = await uploadPhoto(photo);
            }

            if (cover) {
                updateData["coverPhoto"] = await uploadCover(cover);
            }

            await updateDoc(userRef, updateData);
            onClose()
        }
    }

    const handleFollow = () => {
        if (user) followUser(user.id)
    }

    const handleUnfollow = () => {
        if (user) unfollowUser(user.id)
    }

    if (loading) {
        return (
            <Flex alignItems="center" justifyContent="center" minH="100vh">
                <Spinner size='lg' />
            </Flex>
        )
    }
    return (
        <Grid
            gap={6}
            alignItems="flex-start"
        >
            <Box display="flex" flexDirection="column">
                <Box
                    bg="#edf3f8"
                    _dark={{
                        bg: "#3e3e3e",
                    }}
                    style={{
                        backgroundImage: `url(${user?.coverPhoto ? user?.coverPhoto : '/assets/dsdefault.png'})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                    height="100%"
                    width="100%"
                    borderRadius="lg"
                    p={8}
                    display="flex"
                    alignItems="left"
                >
                    <Image
                        src={user?.photo ? user?.photo : '/assets/defaultUser.png'}
                        alt="Profile Picture"
                        borderRadius="full"
                        boxSize={{ base: '110px', md: '150px' }}
                        shadow="lg"
                        border="4px solid"
                        mb={-20}
                        borderColor="gray.900"
                    />
                </Box>
                <Box display="flex" mt={12} justifyContent="space-between">
                    <Box
                        display="flex"
                        py={4}
                        px={{ base: 2, md: 6 }}
                        flexDirection="column"
                        gap={2}
                        flex={1}
                    >
                        <Flex alignItems="center" justifyContent="space-between">
                            <Box>
                                <chakra.h1
                                    fontSize="xl"
                                    fontWeight="bold"
                                    color="white"
                                >
                                    {user?.name ? user?.name : 'Anonymous'}
                                </chakra.h1>
                                <chakra.p
                                    fontSize="sm"
                                    color="gray.300"
                                >
                                    @{user?.username}
                                </chakra.p>
                            </Box>
                            <Box>
                                {user?.id !== currentUser?.id ? (
                                    <Flex
                                        alignItems="center"
                                        gap={3}
                                    >
                                        <Link to={`/messages/${user?.id}`}>
                                            <IconButton
                                                aria-label='send message'
                                                icon={<FiMail />}
                                                size="sm"
                                                fontSize="md"
                                            />
                                        </Link>
                                        {!hasFollow ? (
                                            <Button
                                                size="sm"
                                                bg="brand"
                                                _hover={{ bg: "brandHover" }}
                                                onClick={handleFollow}
                                            >
                                                Follow
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                _hover={{ bg: "red.600" }}
                                                onClick={handleUnfollow}
                                            >
                                                Unfollow
                                            </Button>
                                        )}
                                    </Flex>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={onOpen}
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                            </Box>
                        </Flex>
                        <chakra.p
                            py={2}
                            color="gray.400"
                            w={{ base: "full", md: "80%" }}
                        >
                            {user?.about}
                        </chakra.p>
                        <Flex alignItems="center" gap={3}>
                            <chakra.p
                                fontSize="sm"
                                color="gray.400"
                                _hover={{ textDecoration: "underline" }}
                                cursor="pointer"
                                onClick={doOpen}
                            >
                                <chakra.span
                                    mr={1}
                                    color="gray.100"
                                    fontWeight="semibold"
                                >
                                    {following.length}
                                </chakra.span>
                                Following
                            </chakra.p>
                            <chakra.p
                                fontSize="sm"
                                color="gray.400"
                                _hover={{ textDecoration: "underline" }}
                                cursor="pointer"
                                onClick={doOpen}
                            >
                                <chakra.span
                                    color="gray.100"
                                    mr={1}
                                    fontWeight="semibold"
                                >
                                    {followers.length}
                                </chakra.span>
                                Followers
                            </chakra.p>
                        </Flex>
                    </Box>
                </Box>
            </Box>

            <Box
                mx={{ base: 0, md: 2 }}
            >
                <chakra.h3
                    fontFamily="heading"
                    textTransform="uppercase"
                    fontWeight="semibold"
                    position="relative"
                    _after={{
                        content: '""',
                        position: 'absolute',
                        left: '0',
                        bottom: '-5px',
                        width: '100%',
                        borderBottom: '3px solid teal'
                    }}
                >
                    Projects
                </chakra.h3>
                <SimpleGrid
                    columns={{ base: 1, md: 3 }}
                    spacing={6}
                    my={3}
                >
                    {projects?.map((project, index) => {
                        return <Entry key={index} data={project} />
                    })}
                </SimpleGrid>
            </Box>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg="primary" mx={4}>
                    <ModalHeader>Edit Profile</ModalHeader>
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
                                            placeholder={user?.name ? user?.name : 'John Doe'}
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
                                            placeholder={user?.about ? user?.about : 'you@example.com'}
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
                                            Brief description for your profile.
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="md"
                                        color="gray.50"
                                    >
                                        Photo
                                    </FormLabel>
                                    <Flex alignItems="center" mt={1}>
                                        <Avatar
                                            boxSize={12}
                                            bg="gray.800"
                                            icon={
                                                <Icon
                                                    as={FaUser}
                                                    boxSize={9}
                                                    mt={3}
                                                    rounded="full"
                                                    color="gray.500"
                                                />
                                            }
                                            src={user?.photo}
                                        />
                                        <input
                                            type="file"
                                            id="photoUpload"
                                            style={{ display: 'none' }}
                                            onChange={handlePhotoChange}
                                        />
                                        <Button
                                            type="button"
                                            ml={5}
                                            variant="outline"
                                            size="sm"
                                            fontWeight="medium"
                                            _focus={{
                                                shadow: "none",
                                            }}
                                            onClick={
                                                () => document.getElementById('photoUpload')?.click()
                                            }
                                        >
                                            Change
                                        </Button>
                                    </Flex>
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
                                                            onChange={handleCoverChange}
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
                </ModalContent>
            </Modal>
            <Interactions user={user} hasOpen={hasOpen} hasClose={hasClose} />
        </Grid >
    )
}
