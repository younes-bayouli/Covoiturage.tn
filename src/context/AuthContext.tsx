import { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface Utilisateur {
	id: number;
	email: string;
	nom: string;
	prenom: string;
	telephone: string | null;
	ville: string | null;
	avatarUrl: string | null;
	note: number;
	trajetsEffectues: number;
	trajetsEnTantQueConducteur: number;
	trajetsEnTantQuePassager: number;
	identiteVerifiee: boolean;
	telephoneVerifie: boolean;
	membreDepuis: string;
	role: string; // <---this is a enum in the backend >
}

interface AuthContextType {
	isLoggedIn: boolean;
	utilisateur: Utilisateur | null;
	login: (token: string, utilisateur: Utilisateur) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	// Initialize from localStorage so auth persists on page refresh
	const [isLoggedIn, setIsLoggedIn] = useState(
		() => !!localStorage.getItem("token"),
	);

	const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(() => {
		const stored = localStorage.getItem("utilisateur");
		return stored ? JSON.parse(stored) : null;
	});

	const login = (token: string, user: Utilisateur) => {
		localStorage.setItem("token", token);
		console.log("Storing user in localStorage:", JSON.stringify(user)); // Debug log
		localStorage.setItem("utilisateur", JSON.stringify(user));
		setUtilisateur(user);
		setIsLoggedIn(true);
		console.log("User logged in:", user); // Debug log
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("utilisateur");
		localStorage.setItem("loggingout","true")
		setUtilisateur(null);
		setIsLoggedIn(false);
	};

	return (
		<AuthContext.Provider
			value={{ isLoggedIn, utilisateur, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used inside AuthProvider");
	return context;
}
