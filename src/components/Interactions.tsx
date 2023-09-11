import { useEffect, useState } from 'react';
import { Tabs, TabList, TabPanels, Tab, TabPanel, ModalCloseButton } from '@chakra-ui/react'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody } from '@chakra-ui/react'
import { chakra, Box, Avatar } from '@chakra-ui/react'
import { useFollow } from '../hooks/useFollow';
import { DocumentData } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { IProfile } from '../models/types';

type InteractionsProps = {
    user: IProfile | undefined,
    hasOpen: boolean,
    hasClose: () => void
};

export const Interactions = ({ user, hasOpen, hasClose }: InteractionsProps) => {
    const { followers, following, getUserData } = useFollow(user);
    const [followersData, setFollowersData] = useState<DocumentData | null>(null);
    const [followingData, setFollowingData] = useState<DocumentData | null>(null);

    useEffect(() => {
        const getFollowersData = async (followers: string[]) => {
            const promises = followers.map(userId => getUserData(userId));
            const followersData = await Promise.all(promises);
            return followersData;
        };

        const getFollowingData = async (following: string[]) => {
            const promises = following.map(userId => getUserData(userId));
            const followingData = await Promise.all(promises);
            return followingData;
        };

        async function fetchData() {
            const fetchedFollowersData = await getFollowersData(followers);
            setFollowersData(fetchedFollowersData);
            const fetchedFollowingData = await getFollowingData(following);
            setFollowingData(fetchedFollowingData);
        }

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [followers, following]);

    return (
        <>
            <Modal isOpen={hasOpen} onClose={hasClose}>
                <ModalOverlay />
                <ModalContent bg="primary" mx={4}>
                    <ModalHeader>Interactions</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Tabs>
                            <TabList>
                                <Tab>Following</Tab>
                                <Tab>Followers</Tab>
                            </TabList>

                            <TabPanels>
                                <TabPanel>
                                    {followingData?.length > 0 ? (
                                        <Box display="flex" flexDirection="column" gap={3}>
                                            {followingData?.map((user: IProfile, index: number) => {
                                                return (
                                                    <Link
                                                        to={`/user/${user?.id}`}
                                                        key={index}
                                                    >
                                                        <Box
                                                            display="flex"
                                                            alignItems="center"
                                                            gap={3}
                                                            _hover={{ textDecoration: 'underline' }}
                                                        >
                                                            <Avatar
                                                                name={user?.name}
                                                                src={user?.photo}
                                                            />
                                                            <Box>
                                                                <chakra.h3
                                                                    fontSize="sm"
                                                                    color="gray.200"
                                                                >
                                                                    {user?.name}
                                                                </chakra.h3>
                                                                <chakra.p
                                                                    fontSize="13"
                                                                    color="gray.400"
                                                                    mt={2}
                                                                >
                                                                    {user?.about}
                                                                </chakra.p>
                                                            </Box>
                                                        </Box>
                                                    </Link>
                                                )
                                            })}
                                        </Box>
                                    ) : (
                                        <chakra.p>
                                            There's nothing to show here 👀
                                        </chakra.p>
                                    )}
                                </TabPanel>
                                <TabPanel>
                                    {followersData?.length > 0 ? (
                                        <Box display="flex" flexDirection="column" gap={3}>
                                            {followersData?.map((user: IProfile, index: number) => {
                                                return (
                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        gap={3}
                                                        key={index}
                                                    >
                                                        <Avatar
                                                            name={user?.name}
                                                            src={user?.photo}
                                                        />
                                                        <Box>
                                                            <chakra.h3
                                                                fontSize="sm"
                                                                color="gray.200"
                                                            >
                                                                {user?.name}
                                                            </chakra.h3>
                                                            <chakra.p
                                                                fontSize="13"
                                                                color="gray.400"
                                                                mt={2}
                                                            >
                                                                {user?.about}
                                                            </chakra.p>
                                                        </Box>
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                    ) : (
                                        <chakra.p>
                                            There's nothing to show here 👀
                                        </chakra.p>
                                    )}
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}
