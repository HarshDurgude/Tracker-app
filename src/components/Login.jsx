import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(e) {

        e.preventDefault();

        setError("");

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            console.log("LOGIN SUCCESS");

        } catch (err) {

            console.log("LOGIN ERROR:", err);
            setError("Invalid email or password");

        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

            <div className="w-full max-w-sm bg-white border rounded-xl shadow-sm p-6">

                <div className="mb-6 text-center">

                    <h1 className="text-2xl font-semibold">
                        Task Tracker
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Login to continue
                    </p>

                </div>

                <form
                    onSubmit={handleLogin}
                    className="flex flex-col gap-4"
                >

                    <div>
                        <label className="block text-sm mb-1">
                            Email
                        </label>

                        <input
                            className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">
                            Password
                        </label>

                        <input
                            className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-black text-white rounded-md py-2 hover:bg-gray-800"
                    >
                        Login
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;