import { useState, useMemo } from "react"
import { Box, Flex, Image, Link, chakra, Grid, Avatar, IconButton } from "@chakra-ui/react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { firestore } from "../libs/firebase"
import { useParams } from "react-router-dom"
import { IProfile, IProject } from "../models/types"
import { useFollow } from "../hooks/useFollow";
import { BsBroadcast } from "react-icons/bs"
import { AiFillLike, AiFillDislike } from "react-icons/ai"
import { Comments } from "../components/Comments";
import { useAuth } from "../hooks/useAuth";

export const Project = () => {
    const { slug } = useParams()
    const { getUserData } = useFollow(undefined)
    const [data, setData] = useState<IProject | null>(null)
    const [admin, setAdmin] = useState<null | IProfile>(null)
    const { user } = useAuth()
    const isLiked = data?.likes.includes(`${user?.id}`)
    const isDisliked = data?.dislikes.includes(`${user?.id}`)

    useMemo(() => {
        const fetchData = async () => {
            if (slug) {
                const projectRef = doc(firestore, "projects", slug);
                const docSnap = await getDoc(projectRef);

                if (docSnap.exists()) {
                    const projectData: IProject = {
                        id: docSnap.id as string,
                        name: docSnap.data().name,
                        about: docSnap.data().about,
                        admin: docSnap.data().admin,
                        photo: docSnap.data().photo,
                        url: docSnap.data().url,
                        likes: docSnap.data().likes,
                        dislikes: docSnap.data().dislikes
                    }

                    const user = await getUserData(docSnap.data().admin)
                    setData(projectData)
                    setAdmin(user)
                }

            }

        }
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug])

    const handleLike = async () => {
        if (data) {
            const projectRef = doc(firestore, "projects", data.id);
            await updateDoc(projectRef, {
                likes: arrayUnion(data.admin),
                dislikes: arrayRemove(data.admin)
            });
        }
    };

    const handleDislike = async () => {
        if (data) {
            const projectRef = doc(firestore, "projects", data.id);
            await updateDoc(projectRef, {
                dislikes: arrayUnion(data.admin),
                likes: arrayRemove(data.admin)
            });
        }
    };

    return (
        <Grid
            templateColumns={{ base: 'auto', md: '65% calc(35% - 1rem)' }}
            gap={6}
            alignItems="flex-start"
        >
            <Box
                rounded="lg"
                shadow="md"
            >
                <Image
                    roundedTop="lg"
                    w="full"
                    h={64}
                    fit="cover"
                    src={data?.photo}
                    alt="Article"
                />

                <Box p={6}>
                    <Box>
                        <chakra.span
                            fontSize="xs"
                            textTransform="uppercase"
                        >
                            Project
                        </chakra.span>
                        <chakra.h2
                            display="block"
                            color="gray.100"
                            fontWeight="bold"
                            fontSize="2xl"
                            mt={2}
                        >
                            {data?.name}
                        </chakra.h2>
                        <chakra.p
                            mt={2}
                            fontSize="sm"
                            color="gray.300"
                        >
                            {data?.about}
                        </chakra.p>
                    </Box>

                    <Box
                        display="flex"
                        mt={4}
                    >
                        <Link
                            href={data?.url}
                            display="flex"
                            gap={2}
                            alignItems="center"
                            color="teal.300"
                            _hover={{ textDecoration: "none", color: "teal.600" }}
                        >
                            <BsBroadcast />
                            Live Demo
                        </Link>
                    </Box>

                    {user && (
                        <Flex mt={4} gap={3} justifyContent="flex-end">
                            <IconButton
                                aria-label='Like'
                                size='sm'
                                fontSize='lg'
                                icon={<AiFillLike />}
                                onClick={handleLike}
                                color={isLiked ? 'teal.300' : 'unset'}
                            />
                            <IconButton
                                aria-label='Dislike'
                                size='sm'
                                fontSize='lg'
                                icon={<AiFillDislike />}
                                onClick={handleDislike}
                                color={isDisliked ? 'teal.300' : 'unset'}
                            />
                        </Flex>
                    )}
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    mx={4}
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
                        Join the discussion
                    </chakra.h3>
                    <Box>
                        {slug && (
                            <Comments postId={slug} />
                        )}
                    </Box>
                </Box>
            </Box>
            <Box
                display="flex"
                flexDirection="column"
                gap={6}
                mx={4}
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
                    Author
                </chakra.h3>
                <Box
                    my={2}
                    display="flex"
                >
                    <Flex
                        alignItems="flex-start"
                        gap={4}
                    >
                        <Avatar
                            name={admin?.name}
                            src={admin?.photo}
                            size="lg"
                        />
                        <Flex
                            flexDirection="column"
                            gap={1}
                        >
                            <chakra.h4
                                fontFamily="heading"
                                fontSize="sm"
                                color="gray.100"
                            >
                                {admin?.name}
                            </chakra.h4>
                            <chakra.p
                                fontSize="13"
                                noOfLines={2}
                                color="gray.300"
                            >
                                {admin?.about}
                            </chakra.p>
                        </Flex>
                    </Flex>
                </Box>
            </Box>
        </Grid>
    )
}
