"use client";

import React, {createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    _id: string;
    name: string;
    email: string;
}

interface SessionContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({children}: {children: React.ReactNode}){
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkSession = async () => {
        try{
            const token = localStorage.getItem("token");

            if(!token){
                setUser(null);
                setLoading(false);
                return;
            }

            const response = await fetch("/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if(response.ok){
                const data = await response.json();
                console.log("SessionContext: User data received:", data);
                const userData = data.user;
                const {password, ...safeUserData} = userData;

                setUser(safeUserData);
            } else {
                console.log("SessionContext: Failed to get user data");
                setUser(null);
                localStorage.removeItem("token");
            }
        } catch (error) {
            console.error("SessionContext: Error checking session:", error);
            setUser(null);
            localStorage.removeItem("token");
        } finally {
                setLoading(false);
        }
    };

    const logout = async() => {
        try{
            const token = localStorage.getItem("token");

            if(token){
                await fetch("/api/auth/logout", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error("SessionContext: Error logging out:", error);
        } finally {
            localStorage.removeItem("token");
            setUser(null);
            router.push("/");
        }
    };

    useEffect(() => {
        console.log("SessionContext: Initial check");
        checkSession();
    }, []);
    
    return (
        <SessionContext.Provider value={{user, loading, isAuthenticated: !!user, logout, checkSession}}>
            {children}
        </SessionContext.Provider>
    )
}

export function useSession() {
    const context = useContext(SessionContext);
    if(context === undefined){
        throw new Error("useSession must be used within a SessionProvider");
    }

    return context;
}