import useAuth from "../hooks/useAuth";

function Settings() {

    const { logout } = useAuth();
    return (
        <div>
            <h1 className="text-lg text-gray-600 mt-0.5 font-bold" >Settings</h1>
            <button onClick={logout} className="inline-flex items-center justify-center border-black border-2 rounded-sm p-1  m-1 text-sm leading-none text-white cursor-pointer mt-2 hover:bg-red-600 bg-red-500">LogOut</button>
        </div>
    );
}

export default Settings;