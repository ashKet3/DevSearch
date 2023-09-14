import { Avatar, Box, Drawer, DrawerContent, DrawerOverlay, Flex } from "@chakra-ui/react";
import { Icon, IconButton, Input, InputGroup, InputLeftElement, ChakraProps } from "@chakra-ui/react"
import { Text, useColorModeValue, useDisclosure, Button, useToast } from "@chakra-ui/react"
import { FaBell, FaSearch } from "react-icons/fa";
import { BiSolidMessageSquareDetail, BiSolidUserCircle } from "react-icons/bi"
import { FiMenu, FiSearch } from "react-icons/fi";
import { IoIosAddCircle } from "react-icons/io"
import { BiLogOutCircle, BiLogInCircle } from "react-icons/bi"
import { MdHome } from "react-icons/md"
import { Outlet } from "react-router-dom";
import { auth } from "../libs/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../hooks/useAuth";
import { Create } from "./Create";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NavItemProps extends ChakraProps {
    icon?: React.ElementType;
    children?: React.ReactNode;
    onClick?: () => void;
}

export const Layout = () => {
    const sidebar = useDisclosure();
    const creator = useDisclosure()
    const color = useColorModeValue("gray.600", "gray.300");
    const { user } = useAuth();
    const [query, setQuery] = useState('')
    const navigate = useNavigate()
    const toast = useToast()

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                console.log("User signed out");
            })
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigate(`/search/${query}`)
        }
    };

    const NavItem: React.FC<NavItemProps> = (props) => {
        const { icon, children, ...rest } = props;
        return (
            <Flex
                align="center"
                px="4"
                pl="4"
                py="3"
                cursor="pointer"
                color="gray.400"
                _hover={{
                    color: "gray.600",
                }}
                role="group"
                fontWeight="semibold"
                transition=".15s ease"
                {...rest}
            >
                {icon && (
                    <Icon
                        mx="2"
                        boxSize="4"
                        _groupHover={{
                            color: color,
                        }}
                        as={icon}
                    />
                )}
                {children}
            </Flex>
        );
    };

    const SidebarContent: React.FC<ChakraProps> = (props) => (
        <Box
            as="nav"
            pos="fixed"
            top="0"
            left="0"
            zIndex="sticky"
            h="full"
            pb="10"
            overflowX="hidden"
            overflowY="auto"
            bg="primary"
            color="inherit"
            borderRightWidth="1px"
            w="60"
            {...props}
        >
            <Flex px="4" py="5" align="center">
                <Text
                    fontSize="2xl"
                    ml="2"
                    color="brand.500"
                    _dark={{ color: "white" }}
                    fontWeight="semibold"
                >
                    DevSearch
                </Text>
            </Flex>
            <Flex
                direction="column"
                as="nav"
                fontSize="md"
                color="gray.600"
                aria-label="Main Navigation"
            >
                <Link to="/">
                    <NavItem icon={MdHome}>Home</NavItem>
                </Link>
                <Link to="/search">
                    <NavItem icon={FaSearch}>Search</NavItem>
                </Link>
                <Link to={`/messages`}>
                    <NavItem icon={BiSolidMessageSquareDetail}>Messages</NavItem>
                </Link>
                <NavItem onClick={user ? creator.onOpen : () => toast({
                    title: 'Unauthorized',
                    description: "Please login first.",
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                })} icon={IoIosAddCircle}>Create</NavItem>
                {user && (
                    <>
                        <Link to={`/user/${user?.id}`}>
                            <NavItem icon={BiSolidUserCircle}>Profile</NavItem>
                        </Link>
                        <NavItem icon={BiLogOutCircle} onClick={handleLogout}>Logout</NavItem>
                    </>
                )}
            </Flex>
        </Box>
    );
    return (
        <Box as="section" bg="primary" minH="100vh">
            <SidebarContent display={{ base: "none", md: "unset" }} />
            <Drawer
                isOpen={sidebar.isOpen}
                onClose={sidebar.onClose}
                placement="left"
            >
                <DrawerOverlay />
                <DrawerContent>
                    <SidebarContent w="full" borderRight="none" />
                </DrawerContent>
            </Drawer>
            <Box ml={{ base: 0, md: 60 }} transition=".3s ease">
                <Flex
                    as="header"
                    align="center"
                    justify="space-between"
                    w="full"
                    px="4"
                    borderBottomWidth="1px"
                    color="inherit"
                    h="14"
                    bg="primary"
                >
                    <IconButton
                        aria-label="Menu"
                        display={{ base: "inline-flex", md: "none" }}
                        onClick={sidebar.onOpen}
                        icon={<FiMenu />}
                        size="sm"
                    />

                    <InputGroup w="96" display={{ base: "none", md: "flex" }}>
                        <InputLeftElement color="gray.500">
                            <FiSearch />
                        </InputLeftElement>
                        <Input
                            focusBorderColor="brand"
                            placeholder="Search ..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                    </InputGroup>

                    <Flex align="center" gap={4}>
                        <Icon color="gray.500" as={FaBell} cursor="pointer" />
                        {!user ? (
                            <Link to="/auth/login">
                                <Button variant='outline' borderColor='brand' size="sm" _hover={{ bg: 'brand' }} leftIcon={<BiLogInCircle />}>
                                    Sign in
                                </Button>
                            </Link>
                        ) : (
                            <Avatar
                                size='sm'
                                name={user.name ? user.name : `${user.email}`}
                                src={user.photo ? user.photo : ""}
                            />
                        )}

                    </Flex>
                </Flex>

                <Box as="main" p="4">
                    <Outlet />
                </Box>
            </Box>
            <Create isOpen={creator.isOpen} onClose={creator.onClose} />
        </Box>
    );
};
