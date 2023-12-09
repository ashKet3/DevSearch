import { useState, ChangeEvent } from "react";
import { Box, Text, Input, Button, Container, VStack, Link, Flex } from "@chakra-ui/react";
import { FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, } from "firebase/auth";
import { auth } from "../../libs/firebase";
import { BsGoogle } from "react-icons/bs"
import { useNavigate } from "react-router-dom";
import { useToast } from '@chakra-ui/react'

interface errorFields {
    email?: boolean
    password?: boolean
}

export const Login = () => {
    const [endUser, setEndUser] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState<errorFields>({})
    const navigate = useNavigate();
    const toast = useToast()

    const handleLogin = () => {
        const { email, password } = endUser;
        if (email && password) {
            signInWithEmailAndPassword(auth, email, password)
                .then(({ user }) => {
                    toast({
                        title: 'Welcome Back, Sunshine!',
                        description: "You're logged in and ready to shine! 🌻",
                        status: 'success',
                        duration: 9000,
                        isClosable: true,
                    })
                    if (user) navigate("/");
                })
                .catch((error) => {
                    toast({
                        title: 'Oopsie Daisy, Error!',
                        description: JSON.stringify(error.message),
                        status: 'error',
                        duration: 9000,
                        isClosable: true,
                    })
                    console.log(error);
                });
        } else {
            setError({
                email: email === '',
                password: password === ''
            });
        }
    };

    const handleGoogleLogin = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                toast({
                    title: 'Welcome Back, Sunshine!',
                    description: "You're logged in and ready to shine! 🌻",
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                })
                if (user) {
                    navigate("/")
                }
            })
            .catch((error) => {
                toast({
                    title: 'Oopsie Daisy, Error!',
                    description: JSON.stringify(error.message),
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                })
                console.log(error);
            });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEndUser({
            ...endUser,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <Flex alignItems="center" minH="100vh">
            <Container maxW={{ base: 'sm', md: 'lg' }}>
                <Box p={6} shadow="md" rounded="md" display="flex" flexDirection="column">
                    <Box display="flex" justifyContent="center">
                        <Button
                            bg="#4285F4"
                            alignSelf="flex-start"
                            leftIcon={<BsGoogle />}
                            onClick={handleGoogleLogin}
                            _hover={{ bg: "#1F4CB9" }}
                            mb={{ base: 10, md: 8 }}
                        >
                            Sign In with Google
                        </Button>
                    </Box>
                    <VStack spacing={6} align="stretch">
                        <FormControl id="email" isRequired isInvalid={error.email}>
                            <FormLabel>Email address</FormLabel>
                            <Input
                                type="email"
                                name="email"
                                focusBorderColor="brand"
                                value={endUser.email}
                                onChange={handleChange}
                            />
                            {error.email && (
                                <FormErrorMessage>Email is required.</FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl id="password" isRequired isInvalid={error.password}>
                            <FormLabel>Password</FormLabel>
                            <Input
                                type="password"
                                name="password"
                                focusBorderColor="brand"
                                value={endUser.password}
                                onChange={handleChange}
                            />
                            {error.password && (
                                <FormErrorMessage>Password is required.</FormErrorMessage>
                            )}
                        </FormControl>
                        <Button
                            bg="brand"
                            mt={6}
                            alignSelf="flex-start"
                            _hover={{ bg: "brandHover" }}
                            onClick={handleLogin}
                        >
                            Sign In
                        </Button>
                        <Text
                            fontSize="sm"
                            my={3}
                        >
                            New to us? <Link color="brand" href="/auth/register">Sign Up</Link>
                        </Text>
                    </VStack>
                </Box>
            </Container >
        </Flex>
    )
}
