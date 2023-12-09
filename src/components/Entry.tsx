import { useEffect, useState } from "react";
import { IProfile, IProject } from "../models/types"
import { Box, Flex, Link, chakra, Image, IconButton, Avatar } from "@chakra-ui/react";
import { LinkBox, LinkOverlay } from '@chakra-ui/react'
import { useFollow } from "../hooks/useFollow";
import { AiFillLike, AiFillDislike } from "react-icons/ai"
import { firestore } from "../libs/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

export const Entry = ({ data, variant }: { data: IProject, variant?: string }) => {
    const [admin, setAdmin] = useState<null | IProfile>(null)
    const { getUserData } = useFollow(undefined)
    const { user } = useAuth()
    const isLiked = data.likes.includes(`${user?.id}`)
    const isDisliked = data.dislikes.includes(`${user?.id}`)


    useEffect(() => {
        const fetchUser = async () => {
            const user = await getUserData(data.admin)
            setAdmin(user)
        }
        fetchUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    const handleLike = async () => {
        const projectRef = doc(firestore, "projects", data.id);
        await updateDoc(projectRef, {
            likes: arrayUnion(user?.id),
            dislikes: arrayRemove(user?.id)
        });
    };

    const handleDislike = async () => {
        const projectRef = doc(firestore, "projects", data.id);
        await updateDoc(projectRef, {
            dislikes: arrayUnion(user?.id),
            likes: arrayRemove(user?.id)
        });
    };

    return (
        <LinkBox
            w="full"
            maxW="sm"
            px={4}
            py={3}
            bg={variant === "solid" ? "secondary" : "unset"}
            shadow="md"
            rounded="md"
        >
            <LinkOverlay href={`/project/${data.id}`} display="flex" flexDirection="column" gap={3}>
                <chakra.h1
                    fontSize="lg"
                    fontWeight="bold"
                    mt={2}
                    color="gray.800"
                    _dark={{ color: "white" }}
                >
                    {data.name}
                </chakra.h1>

                <Image
                    src={data.photo}
                    alt={data.name}
                    width="full"
                    height="180px"
                    objectFit="cover"
                />

                <chakra.p
                    fontSize="sm"
                    mt={2}
                    color="gray.300"
                    noOfLines={2}
                >
                    {data.about}
                </chakra.p>
            </LinkOverlay>

            <Box>
                <Flex
                    alignItems="center"
                    mt={2}
                    color="gray.200"
                    fontSize='sm'
                >
                    <span>Visit on:</span>
                    <Link
                        mx={2}
                        cursor="pointer"
                        textDecor="none"
                        color="teal.300"
                        href={data.url}
                    >
                        {data.url}
                    </Link>
                </Flex>
            </Box>

            <Flex mt="4" justifyContent="space-between">
                {user && (
                    <Flex gap={3}>
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
                <Link href={`/user/${admin?.id}`}>
                    <Flex alignItems="center" gap={1}>
                        <Avatar
                            name={admin?.name}
                            src={admin?.photo}
                            size="xs"
                        />
                        <chakra.span
                            fontSize="sm"
                            color="gray.200"
                        >
                            {admin?.name}
                        </chakra.span>
                    </Flex>
                </Link>
            </Flex>
        </LinkBox>
    )
}
