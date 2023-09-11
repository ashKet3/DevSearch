import React, { useEffect, useState } from "react"
import { Box, chakra, Grid } from "@chakra-ui/react"
import { Avatar, Divider, Text, Flex, Icon } from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { useFollow } from "../hooks/useFollow"
import { useParams } from "react-router-dom"
import { IProfile } from "../models/types"
import { ref, push, onValue, off, set } from 'firebase/database';
import { useAuth } from "../hooks/useAuth"
import { database } from "../libs/firebase"
import { Message } from "../models/types"
import { generateChatId } from "../libs/utils"
import { Input, InputGroup, Button } from "@chakra-ui/react"
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'
import { BsReplyFill, BsX } from 'react-icons/bs'
import { DocumentData } from "firebase/firestore";
import { MessageBubble } from "../components/MessageBubble"

export const Messages = () => {
    const { slug } = useParams()
    const { user } = useAuth()
    const [newMessage, setNewMessage] = useState('');
    const [chats, setChats] = useState<Message[]>([]);
    const [selected, setSelected] = useState<Message | undefined>(undefined)
    const [receiver, setReceiver] = useState<IProfile | null>(null)
    const { getUserData, following } = useFollow(user ? user : undefined)
    const [followingData, setFollowingData] = useState<DocumentData | null>(null);

    useEffect(() => {
        const fetchReceiver = async () => {
            if (slug) {
                const receiverObj = await getUserData(slug)
                setReceiver(receiverObj)
            }
        }

        fetchReceiver()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug])


    useEffect(() => {
        if (user && receiver) {
            const chatId = generateChatId(user?.id, receiver?.id)
            const messagesRef = ref(database, 'chats/' + chatId);
            const unsub = onValue(messagesRef, (snapshot) => {
                const data = snapshot.val();
                const messageList = data ? Object.keys(data).map((key) => data[key]) : [];
                setChats(messageList);
            });

            return () => {
                off(messagesRef, 'value', unsub)
            }
        }
    }, [user, receiver]);

    useEffect(() => {
        const getFollowingData = async (following: string[]) => {
            const promises = following.map(userId => getUserData(userId));
            const followingData = await Promise.all(promises);
            return followingData;
        };
        async function fetchData() {
            const fetchedFollowingData = await getFollowingData(following);
            setFollowingData(fetchedFollowingData);
        }

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [following])

    const sendMessage = (replyTo: Message | null) => {
        if (newMessage.trim() !== '') {
            if (user && receiver) {
                const chatId = generateChatId(user?.id, receiver?.id)
                const messagesRef = ref(database, 'chats/' + chatId);
                const newMessageRef = push(messagesRef)
                set(newMessageRef, {
                    sender: user,
                    receiver: receiver,
                    text: newMessage,
                    replyTo: replyTo,
                    timestamp: Date.now(),
                });
                setSelected(undefined)
                setNewMessage('');
            }
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            sendMessage(selected ? selected : null);
        }
    };

    return (
        <>
            <Grid
                templateColumns={{ base: 'auto', md: '30% calc(70% - 1rem)' }}
                gap={{ base: 6, md: "2rem" }}
                alignItems="flex-start"
                mx={{ base: 2, md: 4 }}
            >
                <Box display={{ base: slug ? 'none' : 'flex', md: 'flex' }} flexDirection="column">
                    <Box mb={4}>
                        <chakra.h2
                            fontSize='xl'
                            fontWeight='semibold'
                            mb={3}
                        >
                            Messages
                        </chakra.h2>
                        <Divider />
                    </Box>
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap={6}
                        mt={3}
                    >
                        {followingData?.map((chat: IProfile, index: number) => {
                            return (
                                <Link
                                    key={index}
                                    to={`/messages/${chat.id}`}
                                >
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={3}
                                        _hover={{ textDecoration: 'underline' }}
                                    >
                                        <Avatar
                                            name={chat.name}
                                            src={chat.photo}
                                        />
                                        <Box>
                                            <chakra.h3
                                                fontSize="md"
                                                color="gray.200"
                                            >
                                                {chat.name}
                                            </chakra.h3>
                                            <chakra.p
                                                fontSize="14"
                                                color="gray.400"
                                            >
                                                @{chat.username}
                                            </chakra.p>
                                        </Box>
                                    </Box>
                                </Link>
                            )
                        })}
                    </Box>
                </Box>
                {!slug ? (
                    <Box
                        display={{ base: 'none', md: 'flex' }}
                        alignItems="center"
                        justifyContent="center"
                        minH="50vh"
                    >
                        <Box>
                            <chakra.h3
                                fontSize='2xl'
                                fontWeight='bold'
                            >
                                Select a message
                            </chakra.h3>
                            <chakra.p>Choose from your existing conversations</chakra.p>
                        </Box>
                    </Box>
                ) : (
                    <Box display="flex" gap={10}>
                        <Divider
                            display={{ base: 'none', md: 'block' }}
                            bg="whiteAlpha.100"
                            h="100vh"
                            width="3px"
                        />
                        <Box w="full" h="100%">
                            <Card
                                display="flex"
                                flexDirection="column"
                                h="600px"
                                bg="primary"
                            >
                                <CardHeader
                                    p={0}
                                >
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={3}
                                        mb={2}
                                    >
                                        <Avatar
                                            name={receiver?.name}
                                            src={receiver?.photo}
                                        />
                                        <Box>
                                            <chakra.h3
                                                fontSize="md"
                                                color="gray.200"
                                            >
                                                {receiver?.name}
                                            </chakra.h3>
                                            <chakra.p
                                                fontSize="14"
                                                color="gray.400"
                                            >
                                                @{receiver?.username}
                                            </chakra.p>
                                        </Box>
                                    </Box>
                                    <Divider mt={4} />
                                </CardHeader>
                                <CardBody overflow="scroll" position="relative">
                                    {chats?.map((message) => {
                                        return (
                                            <MessageBubble
                                                key={message.timestamp}
                                                message={message}
                                                setSelected={setSelected}
                                            />
                                        )
                                    })}
                                </CardBody>
                                <CardFooter display="flex" flexDirection="column">
                                    {selected && (
                                        <Flex
                                            direction="column"
                                            bg="gray.700"
                                            mb={3}
                                            py={3}
                                            px={4}
                                            borderRadius="lg"
                                        >
                                            <Flex justifyContent="space-between" alignItems="center">
                                                <Flex alignItems="center" gap={4}>
                                                    <Icon as={BsReplyFill} boxSize={6} />
                                                    <Text fontWeight="semibold" fontFamily="heading" fontSize="sm">
                                                        {selected.sender.username}
                                                    </Text>
                                                </Flex>
                                                <Icon
                                                    as={BsX}
                                                    boxSize={6}
                                                    onClick={() => setSelected(undefined)}
                                                    cursor="pointer"
                                                />
                                            </Flex>
                                            <Box
                                                maxWidth="75%"
                                                ml={10}
                                            >
                                                <Text fontSize="sm" color="gray.300">{selected.text}</Text>
                                            </Box>
                                        </Flex>
                                    )}
                                    <InputGroup display="flex" gap={3}>
                                        <Input
                                            variant="solid"
                                            type="text"
                                            value={newMessage}
                                            onKeyDown={handleKeyDown}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Send a message ..."
                                            fontSize={14}
                                        />
                                        <Button
                                            onClick={() => sendMessage(selected ? selected : null)}
                                            bg="brand"
                                            _hover={{ bg: 'brandHover' }}
                                            fontSize={14}
                                        >
                                            Send
                                        </Button>
                                    </InputGroup>
                                </CardFooter>
                            </Card>
                        </Box>
                    </Box>
                )}
            </Grid>
        </>
    )
}
