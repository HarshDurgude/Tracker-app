import React from "react";
import { Link, Outlet } from "react-router";
import useAuth from "../hooks/useAuth";

function AppLayout() {

    const { logout } = useAuth();

    const commonButtonStyle =
        "inline-flex items-center justify-center border-2 rounded-sm p-1  m-1 text-sm leading-none";

    return (
        <div className="m-4 flex flex-col items-center">

            <div className="flex justify-between w-80">

                <div className="text-xl font-bold leading-none py-2">
                    Today's Tasks
                </div>

                <div className="">

                    <Link
                        to="/archive"
                        className={`${commonButtonStyle} bg-blue-300 hover:bg-blue-400`}
                    >
                        Archives
                    </Link>

                    <button
                        onClick={logout}
                        className={`${commonButtonStyle} bg-gray-300 hover:bg-red-300`}
                    >
                        Logout
                    </button>

                </div>

            </div>

            <Outlet />

        </div>
    );
}

export default AppLayout;