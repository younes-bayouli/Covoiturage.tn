"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
// @ts-ignore
import { Fetch } from "../../hooks/Fetch";

export function LoginPage() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from || "/profile";

	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({ email: "", password: "" });
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [backendUp, setBackendUp] = useState(true);

	const fakeLoginData = {
		email: formData.email,
		nom: "Younes",
		prenom: "King",
		telephone: "00000000",
		ville: "Tunis",
		avatarUrl: null,
		note: 5,
		trajetsEffectues: 0,
		trajetsEnTantQueConducteur: 0,
		trajetsEnTantQuePassager: 0,
		identiteVerifiee: false,
		telephoneVerifie: false,
		membreDepuis: new Date().toISOString(),
		token: "fake-jwt-token-12345",
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const result = await Fetch(
				"http://localhost:8080/auth/login",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: formData.email,
						motDePasse: formData.password,
					}),
				},
				{
					retries : 0,
					retryDelay: 1000,
					healthCheck: true,
					fakeData: fakeLoginData,
					timeout: 10000,
				},
			);

			setBackendUp(result.backendUp);

			console.log("Login result:", result);

			if (result.success && result.data.data.token) {
				console.log("Login successful, token:", result.data.data.token);
				// Login successful
				login(result.data.data.token, {
					id: result.data.data.user.id,
					email: result.data.data.user.email,
					nom: result.data.data.user.nom,
					prenom: result.data.data.user.prenom,
					telephone: result.data.data.user.telephone,
					ville: result.data.data.user.ville,
					avatarUrl: result.data.data.user.avatarUrl,
					note: result.data.data.user.note,
					trajetsEffectues: result.data.data.user.trajetsEffectues,
					trajetsEnTantQueConducteur:
						result.data.data.user.trajetsEnTantQueConducteur,
					trajetsEnTantQuePassager:
						result.data.data.user.trajetsEnTantQuePassager,
					identiteVerifiee: result.data.data.user.identiteVerifiee,
					telephoneVerifie: result.data.data.user.telephoneVerifie,
					membreDepuis: result.data.data.user.membreDepuis,
					role: result.data.data.user.role,
				});
				navigate(from, { replace: true });
			} else {
				setError("Email ou mot de passe incorrect.");
			}
		} catch (err: any) {
			setError(
				err.message || "Une erreur est survenue. Veuillez réessayer.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<Card className="border-border shadow-lg">
					<CardHeader className="space-y-1 pb-4">
						<CardTitle className="font-[family-name:var(--font-display)] text-2xl font-bold text-center">
							Login
						</CardTitle>
						<CardDescription className="text-center">
							Entrez vos identifiants pour continuer
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* Backend offline banner */}
						{!backendUp && (
							<div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800 text-center">
								⚠️ Serveur inaccessible. Utilisation des données
								de démonstration.
							</div>
						)}

						{/* Error message */}
						{error && (
							<div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 text-center">
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Email */}
							<div className="space-y-2">
								<Label htmlFor="email">Adresse email</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="email"
										type="email"
										placeholder="vous@exemple.com"
										className="pl-10"
										value={formData.email}
										onChange={(e) =>
											setFormData({
												...formData,
												email: e.target.value,
											})
										}
										required
										disabled={loading}
									/>
								</div>
							</div>

							{/* Password */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="password">
										Mot de passe
									</Label>
									<Link
										to="/forgot-password"
										className="text-sm text-primary hover:underline"
									>
										Mot de passe oublie?
									</Link>
								</div>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="password"
										type={
											showPassword ? "text" : "password"
										}
										placeholder="Votre mot de passe"
										className="pl-10 pr-10"
										value={formData.password}
										onChange={(e) =>
											setFormData({
												...formData,
												password: e.target.value,
											})
										}
										required
										disabled={loading}
									/>
									<button
										type="button"
										onClick={() =>
											setShowPassword(!showPassword)
										}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										disabled={loading}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							<Button
								type="submit"
								className="my-8 w-full bg-primary text-primary-foreground hover:bg-primary/90"
								disabled={loading}
							>
								{loading
									? "Connexion en cours..."
									: "Se connecter"}
							</Button>
						</form>

						<p className="mt-6 text-center text-sm text-muted-foreground">
							Pas encore de compte?{" "}
							<Link
								to="/signin"
								className="font-semibold text-primary hover:underline"
							>
								Inscrivez-vous
							</Link>
						</p>
					</CardContent>
				</Card>

				<p className="mt-6 text-center text-xs text-muted-foreground">
					En vous connectant, vous acceptez nos{" "}
					<Link to="/terms" className="text-primary hover:underline">
						Conditions d&apos;utilisation
					</Link>{" "}
					et notre{" "}
					<Link
						to="/privacy"
						className="text-primary hover:underline"
					>
						Politique de confidentialite
					</Link>
				</p>
			</div>
		</main>
	);
}
