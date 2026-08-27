import React from "react";
import { NavLink, Outlet } from "react-router";
import useAuth from "../hooks/useAuth";

function AppLayout() {



    const commonButtonStyle =
        "inline-flex items-center justify-center border-2 rounded-sm p-1  m-1 text-sm leading-none";

    return (
        <div className="m-4 flex flex-col items-center">

            <div className="flex justify-between w-80 ">

                <NavLink to="/" className={({ isActive }) => (
                    `inline-flex font-bold items-center justify-center rounded-sm px-1 border-2  m-1 text-xl leading-none ${isActive ? "border-white" : "border-black hover:bg-gray-300"}`
                )}>
                    Tasks
                </NavLink>

                <div className="">
                    {/* border-[oklch(0.64_0_0)] */}
                    <NavLink
                        to="/archive"
                        className={({ isActive }) => (
                            `${commonButtonStyle}  bg-blue-300 hover:bg-blue-400 ${isActive ? "border-[oklch(0.64_0_0)]" : "border-black"} `
                        )}
                    >
                        Archives
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) => (
                            `${commonButtonStyle}  bg-gray-300 hover:bg-red-300 ${isActive ? "border-[oklch(0.64_0_0)]" : "border-black"} `
                        )}
                    >
                        Settings
                    </NavLink>

                </div>

            </div>

            <Outlet />

        </div>
    );
}

export default AppLayout;