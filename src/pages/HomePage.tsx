import { useMemo, useState } from "react"
import { firestore } from "../libs/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { IProject } from "../models/types";
import { Box, SimpleGrid } from "@chakra-ui/react";
import { Entry } from "../components/Entry";

export const HomePage = () => {
    const [projects, setProjects] = useState<IProject[]>([]);

    useMemo(() => {
        const docRef = collection(firestore, "projects");

        const unsubscribe = onSnapshot(docRef, (snapshot) => {
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
    }, []);

    return (
        <Box as="main">
            <SimpleGrid
                columns={{ base: 1, md: 3 }}
                spacing={{ base: 6, md: 10 }}
                my={5}
                mx={{ base: 1, md: 4 }}
            >
                {projects?.map((project, index) => {
                    return <Entry key={index} data={project} variant="solid" />
                })}
            </SimpleGrid>
        </Box>
    )
}
