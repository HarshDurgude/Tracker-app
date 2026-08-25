import { useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signOut
} from "firebase/auth";
import { auth } from "../services/firebase";


function useAuth() {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, (user) => {


            setUser(user);
            setLoading(false);
        });

        return unsubscribe;

    }, []);


    async function logout() {

        try {

            await signOut(auth);

            console.log("AUTH: LOGGED OUT");

        } catch (err) {

            console.log("LOGOUT ERROR:", err);

        }
    }

    return { user, loading, logout };
}

export default useAuth;