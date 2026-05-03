"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Car, Mail, Lock, Eye, EyeOff, User, Phone, Check } from "lucide-react";
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
import { cn } from "@/lib/utils";

const passwordRequirements = [
	{ label: "Au moins 8 caracteres", test: (p: string) => p.length >= 8 },
	{ label: "Une lettre majuscule", test: (p: string) => /[A-Z]/.test(p) },
	{ label: "Une lettre minuscule", test: (p: string) => /[a-z]/.test(p) },
	{ label: "Un chiffre", test: (p: string) => /[0-9]/.test(p) },
];

export function RegisterPage() {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		acceptTerms: false,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (step === 1) {
			setStep(2);
			return;
		}
		setIsLoading(true);
		// Simulate API call
		try {
			const response = fetch("http://localhost:8080/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: formData.email,
					nom: formData.lastName,
					prenom: formData.firstName,
					telephone: formData.phone,
					motDePasse: formData.password,
				}),
			});
		} catch (error) {
			setIsLoading(false);
			alert("Une erreur est survenue lors de l'inscription.");
			return;
		}
		setTimeout(() => {
			setIsLoading(false);
			navigate("/login");
		}, 1500);
	};

	const passwordsMatch =
		formData.password === formData.confirmPassword &&
		formData.confirmPassword.length > 0;

	return (
		<main className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="mb-8 flex flex-col items-center">
					<Link to="/" className="flex items-center gap-2">
						<img
							style={{ height: 90 }}
							src="public\Untitled (1).png"
							alt=""
						/>
					</Link>
					<p className="text-muted-foreground text-center">
						Rejoignez la communaute Covoiturage.tn
					</p>
				</div>

				{/* Progress Steps */}
				<div className="mb-6 flex items-center justify-center gap-2">
					<div
						className={cn(
							"flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
							step >= 1
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground",
						)}
					>
						1
					</div>
					<div
						className={cn(
							"h-1 w-12 rounded-full transition-colors",
							step >= 2 ? "bg-primary" : "bg-muted",
						)}
					/>
					<div
						className={cn(
							"flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
							step >= 2
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground",
						)}
					>
						2
					</div>
				</div>

				<Card className="border-border shadow-lg">
					<CardHeader className="space-y-1 pb-4">
						<CardTitle className="font-[family-name:var(--font-display)] text-2xl font-bold text-center">
							{step === 1
								? "Creez votre compte"
								: "Securisez votre compte"}
						</CardTitle>
						<CardDescription className="text-center">
							{step === 1
								? "Entrez vos informations personnelles"
								: "Choisissez un mot de passe securise"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{step === 1 ? (
								<>
									{/* Name Fields */}
									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-2">
											<Label htmlFor="firstName">
												Prenom
											</Label>
											<div className="relative">
												<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
												<Input
													id="firstName"
													type="text"
													placeholder="Ahmed"
													className="pl-10"
													value={formData.firstName}
													onChange={(e) =>
														setFormData({
															...formData,
															firstName:
																e.target.value,
														})
													}
													required
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="lastName">
												Nom
											</Label>
											<Input
												id="lastName"
												type="text"
												placeholder="Ben Ali"
												value={formData.lastName}
												onChange={(e) =>
													setFormData({
														...formData,
														lastName:
															e.target.value,
													})
												}
												required
											/>
										</div>
									</div>

									{/* Email */}
									<div className="space-y-2">
										<Label htmlFor="email">
											Adresse email
										</Label>
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
											/>
										</div>
									</div>

									{/* Phone */}
									<div className="space-y-2">
										<Label htmlFor="phone">
											Numero de telephone
										</Label>
										<div className="relative">
											<Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="phone"
												type="tel"
												placeholder="+216 XX XXX XXX"
												className="pl-10"
												value={formData.phone}
												onChange={(e) =>
													setFormData({
														...formData,
														phone: e.target.value,
													})
												}
												required
											/>
										</div>
									</div>
								</>
							) : (
								<>
									{/* Password */}
									<div className="space-y-2">
										<Label htmlFor="password">
											Mot de passe
										</Label>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="password"
												type={
													showPassword
														? "text"
														: "password"
												}
												placeholder="Choisissez un mot de passe"
												className="pl-10 pr-10"
												value={formData.password}
												onChange={(e) =>
													setFormData({
														...formData,
														password:
															e.target.value,
													})
												}
												required
											/>
											<button
												type="button"
												onClick={() =>
													setShowPassword(
														!showPassword,
													)
												}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
									</div>

									{/* Password Requirements */}
									<div className="rounded-lg bg-muted/50 p-3 space-y-2">
										{passwordRequirements.map(
											(req, index) => {
												const passed = req.test(
													formData.password,
												);
												return (
													<div
														key={index}
														className={cn(
															"flex items-center gap-2 text-sm transition-colors",
															passed
																? "text-primary"
																: "text-muted-foreground",
														)}
													>
														<div
															className={cn(
																"flex h-4 w-4 items-center justify-center rounded-full transition-colors",
																passed
																	? "bg-primary text-primary-foreground"
																	: "bg-muted",
															)}
														>
															{passed && (
																<Check className="h-3 w-3" />
															)}
														</div>
														{req.label}
													</div>
												);
											},
										)}
									</div>

									{/* Confirm Password */}
									<div className="space-y-2">
										<Label htmlFor="confirmPassword">
											Confirmer le mot de passe
										</Label>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="confirmPassword"
												type={
													showConfirmPassword
														? "text"
														: "password"
												}
												placeholder="Confirmez votre mot de passe"
												className={cn(
													"pl-10 pr-10",
													formData.confirmPassword
														.length > 0 &&
														(passwordsMatch
															? "border-primary"
															: "border-destructive"),
												)}
												value={formData.confirmPassword}
												onChange={(e) =>
													setFormData({
														...formData,
														confirmPassword:
															e.target.value,
													})
												}
												required
											/>
											<button
												type="button"
												onClick={() =>
													setShowConfirmPassword(
														!showConfirmPassword,
													)
												}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
											>
												{showConfirmPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
										{formData.confirmPassword.length > 0 &&
											!passwordsMatch && (
												<p className="text-sm text-destructive">
													Les mots de passe ne
													correspondent pas
												</p>
											)}
									</div>

									{/* Terms Checkbox */}
									<div className="flex items-start gap-3">
										<input
											type="checkbox"
											id="terms"
											className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
											checked={formData.acceptTerms}
											onChange={(e) =>
												setFormData({
													...formData,
													acceptTerms:
														e.target.checked,
												})
											}
											required
										/>
										<label
											htmlFor="terms"
											className="text-sm text-muted-foreground"
										>
											J&apos;accepte les{" "}
											<Link
												to="/terms"
												className="text-primary hover:underline"
											>
												Conditions d&apos;utilisation
											</Link>{" "}
											et la{" "}
											<Link
												to="/privacy"
												className="text-primary hover:underline"
											>
												Politique de confidentialite
											</Link>
										</label>
									</div>
								</>
							)}

							{/* Navigation Buttons */}
							<div className="flex gap-3">
								{step === 2 && (
									<Button
										type="button"
										variant="outline"
										className="flex-1"
										onClick={() => setStep(1)}
									>
										Retour
									</Button>
								)}
								<Button
									type="submit"
									className={cn(
										"mt-8 bg-primary text-primary-foreground hover:bg-primary/90",
										step === 1 ? "w-full" : "flex-1",
									)}
									disabled={
										isLoading ||
										(step === 2 &&
											(!passwordsMatch ||
												!formData.acceptTerms))
									}
								>
									{isLoading
										? "Inscription en cours..."
										: step === 1
											? "Continuer"
											: "Creer mon compte"}
								</Button>
							</div>
						</form>

						{/* Login Link */}
						<p className="mt-6 text-center text-sm text-muted-foreground">
							Deja un compte?{" "}
							<Link
								to="/Login"
								className="font-semibold text-primary hover:underline"
							>
								Connectez-vous
							</Link>
						</p>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
