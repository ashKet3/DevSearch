import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { firestore } from "../libs/firebase";
import { IProject } from "../models/types";
import { Entry } from "../components/Entry";
import { Box, Input, Button } from '@chakra-ui/react';
import { useNavigate } from "react-router-dom";

export const Search = () => {
    const { query: searchTerm } = useParams()
    const [data, setData] = useState<IProject | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const searchDocuments = async () => {
            if (searchTerm) {
                const documentsRef = collection(firestore, 'projects');
                const q = query(documentsRef, where('name', '==', searchTerm));
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach((doc) => {
                    const projectData = {
                        id: doc.id,
                        ...doc.data(),
                    } as IProject;
                    setData(projectData);
                });
            }
        };

        searchDocuments()
    }, [searchTerm])

    return (
        <>
            {!searchTerm && (
                <Box display={{ base: 'flex', md: 'none' }} alignItems='center' gap={4}>
                    <Input
                        placeholder="Search..."
                        focusBorderColor="brand"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button onClick={() => navigate(`/search/${searchQuery}`)} colorScheme="teal">
                        Search
                    </Button>
                </Box>
            )}

            {data && (
                <Box my={3}>
                    <Entry data={data} variant="solid" />
                </Box>
            )}
        </>
    )
}
