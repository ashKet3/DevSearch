import { useState } from "react";
import { Message } from "../models/types";
import { Flex, Avatar, Text, Icon, Box } from "@chakra-ui/react";
import { BsReplyFill } from "react-icons/bs"

type MessageBubbleProps = {
    message: Message;
    setSelected: React.Dispatch<React.SetStateAction<Message | undefined>>
};

export const MessageBubble = ({ message, setSelected }: MessageBubbleProps) => {
    const [showReply, setShowReply] = useState(false)
    const replyTo = message.replyTo ? message.replyTo : undefined

    return (
        <Flex
            direction="column"
            mb={4}
            onDoubleClick={() => setSelected(message)}
            onMouseEnter={() => setShowReply(true)}
            onMouseLeave={() => setShowReply(false)}
        >
            <Flex gap={8} alignItems="center">
                <Flex alignItems="flex-start" gap={3}>
                    <Avatar src={message.sender.photo} name={message.sender.username} size="sm" />
                    <Text
                        fontWeight="semibold"
                        fontFamily="heading"
                        fontSize={15}
                    >
                        {message.sender.username}
                    </Text>
                    {/* <Badge colorScheme='green'>{isMe ? 'Me' : ''}</Badge> */}
                </Flex>
                {showReply && (
                    <Icon as={BsReplyFill} boxSize={5} onClick={() => setSelected(message)} />
                )}
            </Flex>
            {replyTo && (
                <Box
                    maxWidth="75%"
                    ml="3.5rem"
                    mb="0.8rem"
                    mt="0.3rem"
                    borderLeft="3px solid #FF7F57"
                    paddingLeft="1rem"
                >
                    <Text
                        fontWeight="600"
                        fontFamily="heading"
                        color="gray.400"
                        fontSize={15}
                    >
                        {replyTo.sender.username}
                    </Text>
                    <Text fontSize="sm" color="gray.400">{replyTo.text}</Text>
                </Box>
            )}
            <Box
                maxWidth="75%"
                ml="3rem"
            >
                <Text fontSize="sm" color="gray.200">{message.text}</Text>
            </Box>
        </Flex>
    );
};
