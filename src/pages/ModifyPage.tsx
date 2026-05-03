"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	User,
	Mail,
	Phone,
	MapPin,
	Lock,
	Eye,
	EyeOff,
	Camera,
	Trash2,
	Save,
	AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "../context/authContext";

const villes = [
	"Tunis",
	"Sfax",
	"Sousse",
	"Kairouan",
	"Bizerte",
	"Gabès",
	"Nabeul",
	"Monastir",
	"Gafsa",
	"Tozeur",
	"Djerba",
];

export function ModifierPage() {
	const navigate = useNavigate();
	const { logout, utilisateur } = useAuth();


	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [error, setError] = useState("");

    const intial = {
		nom: utilisateur?.nom || "",
		prenom: utilisateur?.prenom || "",
		email: utilisateur?.email || "",
		telephone: utilisateur?.telephone || "",
		ville: utilisateur?.ville || "",
		avatarUrl: utilisateur?.avatarUrl || "",
	};

	const [formData, setFormData] = useState(intial);


	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setError("");
		setSuccessMessage("");
	};

	const handleSave = async () => {
		setError("");
		setSuccessMessage("");
		setIsLoading(true);

		try {
			const token = localStorage.getItem("token");

			const result = await Fetch(
				"http://localhost:8080/api/compte",
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						nom: formData.nom,
						prenom: formData.prenom,
						email: formData.email,
						telephone: formData.telephone,
						ville: formData.ville,
						avatarUrl: formData.avatarUrl,
					}),
				},
				{
					retries: 2,
					retryDelay: 1000,
					healthCheck: true,
				},
			);

			setBackendUp(result.backendUp);

			if (!result.success) {
				throw (
					result.error ?? new Error("Erreur lors de la mise à jour.")
				);
			}

			setSuccessMessage("Profil mis à jour avec succès !");
		} catch (err: any) {
			setBackendUp(false);
			setError(
				err.message ===
					"Backend is unreachable and no fallback data provided."
					? "Serveur inaccessible — vos modifications n'ont pas pu être enregistrées."
					: err.message,
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteAccount = async () => {
		setError("");

		try {
			const token = localStorage.getItem("token");

			const result = await Fetch(
				"http://localhost:8080/api/compte",
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				},
				{
					retries: 1,
					retryDelay: 1000,
					healthCheck: true,
				},
			);

			setBackendUp(result.backendUp);

			if (!result.success) {
				throw (
					result.error ?? new Error("Erreur lors de la suppression.")
				);
			}

			logout();
			navigate("/");
		} catch (err: any) {
			setBackendUp(false);
			setError(
				err.message ===
					"Backend is unreachable and no fallback data provided."
					? "Serveur inaccessible — impossible de supprimer le compte."
					: err.message,
			);
		}
	};

    const hundleUndo=()=>{
        setFormData(intial);
    }

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Back */}
				<Link
					to="/profile"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour au profil
				</Link>

				<h1 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold text-foreground sm:text-3xl">
					Modifier le profil
				</h1>
				<p className="mt-1 text-muted-foreground">
					Mettez à jour vos informations personnelles
				</p>

				<div className="mt-8 space-y-6">
					<Card className="border-border">
						<CardHeader>
							<CardTitle className="text-lg">
								Photo de profil
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6 pt-0">
							<div className="flex items-center gap-6">
								<div className="relative">
									{formData.avatarUrl ? (
										<img
											src={formData.avatarUrl}
											alt="Avatar"
											className="h-20 w-20 rounded-full object-cover border-2 border-border"
										/>
									) : (
										<div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
											<User className="h-10 w-10 text-muted-foreground" />
										</div>
									)}
								</div>
								<div className="flex-1 space-y-2">
									<Label className="text-sm font-medium">
										URL de l'avatar
									</Label>
									<div className="relative">
										<Camera className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											placeholder="https://..."
											className="pl-10"
											value={formData.avatarUrl}
											onChange={(e) =>
												handleChange(
													"avatarUrl",
													e.target.value,
												)
											}
										/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Informations personnelles */}
					<Card className="border-border">
						<CardHeader>
							<CardTitle className="text-lg">
								Informations personnelles
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6 pt-0 space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								{/* Nom */}
								<div className="space-y-2">
									<Label htmlFor="nom">Nom</Label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											id="nom"
											className="pl-10"
											value={formData.nom}
											onChange={(e) =>
												handleChange(
													"nom",
													e.target.value,
												)
											}
										/>
									</div>
								</div>

								{/* Prénom */}
								<div className="space-y-2">
									<Label htmlFor="prenom">Prénom</Label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											id="prenom"
											className="pl-10"
											value={formData.prenom}
											onChange={(e) =>
												handleChange(
													"prenom",
													e.target.value,
												)
											}
										/>
									</div>
								</div>
							</div>

							{/* Email */}
							<div className="space-y-2">
								<Label htmlFor="email">Adresse email</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="email"
										type="email"
										className="pl-10"
										value={formData.email}
										onChange={(e) =>
											handleChange(
												"email",
												e.target.value,
											)
										}
									/>
								</div>
							</div>

							{/* Téléphone */}
							<div className="space-y-2">
								<Label htmlFor="telephone">Téléphone</Label>
								<div className="relative">
									<Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="telephone"
										className="pl-10"
										placeholder="+216 XX XXX XXX"
										value={formData.telephone}
										onChange={(e) =>
											handleChange(
												"telephone",
												e.target.value,
											)
										}
									/>
								</div>
							</div>

							{/* Ville */}
							<div className="space-y-2">
								<Label htmlFor="ville">Ville</Label>
								<div className="relative">
									<MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
									<select
										id="ville"
										value={formData.ville}
										onChange={(e) =>
											handleChange(
												"ville",
												e.target.value,
											)
										}
										className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
									>
										<option value="">
											Sélectionner une ville
										</option>
										{villes.map((ville) => (
											<option key={ville} value={ville}>
												{ville}
											</option>
										))}
									</select>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Feedback messages */}
					{error && (
						<div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive text-center">
							{error}
						</div>
					)}
					{successMessage && (
						<div className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary text-center">
							{successMessage}
						</div>
					)}

					{/* Save button */}
					<div className="flex gap-6 flex-row-reverse">
						<Button onClick={handleSave} disabled={isLoading}>
							<Save className="mr-2 h-4 w-4" />
							{isLoading
								? "Enregistrement..."
								: "Enregistrer les modifications"}
						</Button>
						<Button
							className="bg-blue-500 hover:bg-blue-400"
							onClick={hundleUndo}
							disabled={isLoading}
						>
							Annuler
						</Button>
					</div>

					<Separator />

					{/* Danger zone */}
					<Dialog>
						<DialogTrigger asChild>
							<Button
								variant="destructive"
								className="mt-4 w-full"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Supprimer mon compte
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2 text-destructive">
									<AlertTriangle className="h-5 w-5" />
									Confirmer la suppression
								</DialogTitle>
								<DialogDescription>
									Cette action est irréversible. Votre compte
									et toutes vos données seront définitivement
									supprimés.
								</DialogDescription>
							</DialogHeader>
							<div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
								Êtes-vous absolument sûr de vouloir supprimer
								votre compte ?
							</div>
							<div className="flex gap-3">
								<Button
									variant="destructive"
									className="flex-1"
									onClick={handleDeleteAccount}
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Oui, supprimer
								</Button>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										className="flex-1"
									>
										Annuler
									</Button>
								</DialogTrigger>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</main>
	);
}
