import { useState, useEffect } from "react";
import { auth } from "../libs/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { IProfile } from "../models/types";
import { firestore } from "../libs/firebase";

export const useAuth = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<IProfile | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(firestore, "users", user?.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const userData: IProfile = {
                        id: docSnap.id,
                        ...docSnap.data()
                    }
                    setUser(userData);
                    setLoading(false);
                }
            }
        });

        return unsubscribe;
    }, []);

    return { user, loading };
};
