import { useEffect, useState } from 'react';
import { firestore } from '../libs/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { IProfile } from '../models/types';

export const useFollow = (user: IProfile | undefined) => {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const { user: currentUser } = useAuth()

    useEffect(() => {
        if (user) {
            const followersUnsub = onSnapshot(doc(firestore, 'users', user?.id), (snapshot) => {
                const user = snapshot.data();
                setFollowers(user?.followers || []);
            });

            const followingUnSub = onSnapshot(doc(firestore, 'users', user?.id), (snapshot) => {
                const user = snapshot.data();
                setFollowing(user?.following || []);
            });

            return () => {
                followersUnsub();
                followingUnSub();
            };
        }
    }, [user]);

    const followUser = async (userId: string) => {
        try {
            if (currentUser) {
                const currentUserRef = doc(firestore, 'users', currentUser.id);
                const userRef = doc(firestore, 'users', userId);

                console.log(`following: ${userId}`)
                await updateDoc(currentUserRef, {
                    following: arrayUnion(userId),
                });

                console.log(`followers: ${currentUser.id}`)
                await updateDoc(userRef, {
                    followers: arrayUnion(currentUser.id),
                });
            }
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const unfollowUser = async (userId: string) => {
        try {
            if (currentUser) {
                const currentUserRef = doc(firestore, 'users', currentUser.id);
                const userRef = doc(firestore, 'users', userId);

                await updateDoc(currentUserRef, {
                    following: arrayRemove(userId),
                });

                await updateDoc(userRef, {
                    followers: arrayRemove(currentUser.id),
                });
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    const isFollowing = async (userId: string) => {
        if (currentUser) {
            try {
                const querySnapshot = await getDoc(doc(firestore, 'users', currentUser.id));
                const loggedInUser = querySnapshot.data();
                const isFollowingUser = loggedInUser?.following.includes(userId);

                return isFollowingUser;
            } catch (error) {
                console.error('Error checking if user is following: ', error);
                return false;
            }
        }
    }

    const getUserData = async (userId: string) => {
        const docSnap = await getDoc(doc(firestore, 'users', userId));

        if (docSnap.exists()) {
            return { id: userId, ...docSnap.data() };
        } else {
            console.error("No such user doc!");
            return null;
        }
    }

    return { followers, following, followUser, unfollowUser, isFollowing, getUserData };
};
