import { useState, useEffect, FormEvent } from "react";
import { doc, collection, onSnapshot, addDoc } from "firebase/firestore";
import { firestore } from "../libs/firebase";
import { IProfile } from "../models/types";
import { useAuth } from "../hooks/useAuth";
import { Flex, Avatar, Box, Textarea, Button, chakra, useToast } from '@chakra-ui/react'

interface IComment {
    text: string,
    author: IProfile
}

const Comment = ({ comment }: { comment: IComment }) => {
    return (
        <Flex
            flexDirection="column"
        >
            <Flex alignItems="flex-start" gap={3}>
                <Avatar src={comment?.author?.photo} name={comment?.author?.username} size="sm" />
                <chakra.p
                    fontWeight="semibold"
                    fontFamily="heading"
                    fontSize={15}
                >
                    {comment?.author?.name}
                </chakra.p>
            </Flex>
            <Box
                maxWidth="75%"
                ml="3rem"
            >
                <chakra.p fontSize="sm" color="gray.200">{comment?.text}</chakra.p>
            </Box>
        </Flex>
    );
};

const CommentForm = ({ postId }: { postId: string }) => {
    const { user } = useAuth()
    const [text, setText] = useState('');
    const toast = useToast()

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (user) {
            const commentsCollection = collection(doc(firestore, 'posts', postId), 'comments');
            await addDoc(commentsCollection, {
                text,
                author: user,
            });
        } else {
            toast({
                title: 'Unauthorized',
                description: "Please login first.",
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
        }

        setText('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <Textarea
                my={4}
                placeholder="What's on your mind?"
                focusBorderColor="brand"
                value={text} onChange={e => setText(e.target.value)}
            />
            <Button
                type="submit"
                bg="brand"
                _hover={{ bg: "brandHover" }}
            >
                Post Comment
            </Button>
        </form>
    );
};

export const Comments = ({ postId }: { postId: string }) => {
    const [comments, setComments] = useState<IComment[]>([]);

    useEffect(() => {
        const commentsCollection = collection(doc(firestore, 'posts', postId), 'comments');

        const unsubscribe = onSnapshot(commentsCollection, (snapshot) => {
            const commentsList = snapshot.docs.map(doc => {
                const data = doc.data() as IComment;
                return data;
            });
            setComments(commentsList);
        });

        return () => unsubscribe();
    }, [postId]);

    return (
        <Box my={4}>
            <Flex flexDirection="column" gap={4} my={3}>
                {comments.map((comment, index) => (
                    <Comment key={index} comment={comment} />
                ))}
            </Flex>
            <CommentForm postId={postId} />
        </Box>
    );
};
