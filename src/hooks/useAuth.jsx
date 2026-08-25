import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signOut
} from "firebase/auth";
import { auth } from "../services/firebase";


// 1. Create the Context
export const AuthContext = createContext(null);


// 2. Provider: owns and provides the authentication state
export function AuthProvider({ children }) {

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


    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}


// 3. Custom hook: gives components access to the Context
function useAuth() {

    return useContext(AuthContext);

}

export default useAuth;