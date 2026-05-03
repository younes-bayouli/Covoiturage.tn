"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Mail,
	Phone,
	MapPin,
	Star,
	Calendar,
	FileText,
	CheckCircle2,
	AlertCircle,
	XCircle,
	MessageSquare,
	Ban,
	Trash2,
	Edit,
	Shield,
	WifiOff,
	Crown,
} from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { Fetch } from "@/hooks/Fetch";
import { useAuth } from "@/src/context/authContext";

interface User {
	id: number;
	email: string;
	prenom: string;
	nom: string;
	telephone: string;
	ville: string;
	avatarUrl: string;
	accountStatus: "ACTIVE" | "SUSPENDED" | "BANNED";
	identiteVerifiee: boolean;
	telephoneVerifie: boolean;
	note: number;
	trajetsEffectues: number;
	trajetsEnTantQueConducteur: number;
	trajetsEnTantQuePassager: number;
	membreDepuis: string;
}

// Mock data for fallback
const mockUser: User = {
	id: 1,
	email: "john.doe@example.com",
	prenom: "John",
	nom: "Doe",
	telephone: "+216 95 123 456",
	ville: "Tunis",
	avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
	accountStatus: "ACTIVE",
	identiteVerifiee: true,
	telephoneVerifie: true,
	note: 4.8,
	trajetsEffectues: 12,
	trajetsEnTantQueConducteur: 8,
	trajetsEnTantQuePassager: 4,
	membreDepuis: "2024-01-15T10:30:00",
};

export function UserDetails() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [showSuspendModal, setShowSuspendModal] = useState(false);
	const [showBanModal, setShowBanModal] = useState(false);
	const [suspendReason, setSuspendReason] = useState("");
	const [banReason, setBanReason] = useState("");
	const [actionLoading, setActionLoading] = useState(false);
	const { utilisateur } = useAuth();

	// Fetch user data from backend
	const {
		data: response,
		loading,
		error,
		backendUp,
		refetch,
	} = useFetch(
		`http://localhost:8080/admin/users/${id}`,
		{},
		{
			immediate: true,
			cache: false,
			healthCheck: true,
			fakeData: mockUser,
		},
	);

	// Extract user from response
	const user: User = response?.data || response || mockUser;

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getStatusBadge = (status: string) => {
		const statusConfig: Record<
			string,
			{ bg: string; text: string; icon: React.ReactNode }
		> = {
			ACTIVE: {
				bg: "bg-green-100",
				text: "text-green-800",
				icon: <CheckCircle2 className="h-5 w-5" />,
			},
			SUSPENDED: {
				bg: "bg-yellow-100",
				text: "text-yellow-800",
				icon: <AlertCircle className="h-5 w-5" />,
			},
			BANNED: {
				bg: "bg-red-100",
				text: "text-red-800",
				icon: <XCircle className="h-5 w-5" />,
			},
		};

		const config = statusConfig[status] || statusConfig.ACTIVE;

		return (
			<div
				className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${config.bg} ${config.text}`}
			>
				{config.icon}
				<span className="font-medium">
					{status === "ACTIVE"
						? "Actif"
						: status === "SUSPENDED"
							? "Suspendu"
							: "Banni"}
				</span>
			</div>
		);
	};

	const handleSuspend = async () => {
		setActionLoading(true);
		try {
			const result = await Fetch(
				`http://localhost:8080/admin/users/${id}/status`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ status: "SUSPENDED" }),
				},
				{
					retries: 0,
					retryDelay: 1000,
					healthCheck: true,
				},
			);

			if (result.success) {
				alert("Utilisateur suspendu avec succès");
				setShowSuspendModal(false);
				setSuspendReason("");
				refetch();
			} else {
				alert(
					`Erreur lors de la suspension: ${result.error?.message || "Erreur inconnue"}`,
				);
			}
		} catch (err: any) {
			alert(
				`Erreur lors de la suspension: ${err.message || "Erreur inconnue"}`,
			);
		} finally {
			setActionLoading(false);
		}
	};

	const handleBan = async () => {
		setActionLoading(true);
		try {
			const result = await Fetch(
				`http://localhost:8080/admin/users/${id}/status`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ status: "BANNED" }),
				},
				{
					retries : 0,
					retryDelay: 1000,
					healthCheck: true,
				},
			);

			if (result.success) {
				alert("Utilisateur banni avec succès");
				setShowBanModal(false);
				setBanReason("");
				refetch();
			} else {
				alert(
					`Erreur lors du bannissement: ${result.error?.message || "Erreur inconnue"}`,
				);
			}
		} catch (err: any) {
			alert(
				`Erreur lors du bannissement: ${err.message || "Erreur inconnue"}`,
			);
		} finally {
			setActionLoading(false);
		}
	};

	const handleReactivate = async () => {
		setActionLoading(true);
		try {
			const result = await Fetch(
				`http://localhost:8080/admin/users/${id}/status`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ status: "ACTIVE" }),
				},
				{
					retries : 0,
					retryDelay: 1000,
					healthCheck: true,
				},
			);

			if (result.success) {
				alert("Utilisateur réactivé avec succès");
				refetch();
			} else {
				alert(
					`Erreur lors de la réactivation: ${result.error?.message || "Erreur inconnue"}`,
				);
			}
		} catch (err: any) {
			alert(
				`Erreur lors de la réactivation: ${err.message || "Erreur inconnue"}`,
			);
		} finally {
			setActionLoading(false);
		}
	};

	const isCurrentUser = (userId: number) => {
		return utilisateur?.id === userId;
	};

	if (loading) {
		return (
			<main className="min-h-screen bg-background">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<p className="text-muted-foreground">
						Chargement des détails...
					</p>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Backend Down Warning */}
				{!backendUp && (
					<div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800">
						<WifiOff className="h-5 w-5 shrink-0" />
						<p className="text-sm font-medium">
							Serveur inaccessible — affichage des données en
							cache.
						</p>
					</div>
				)}

				{/* Header */}
				<div className="flex items-center gap-4 mb-8">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate("/admin/users")}
						className="gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour
					</Button>
					<h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-foreground">
						Détails utilisateur
						{isCurrentUser(user.id) && (
							<span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-1 m-6">
								<Crown className="h-3 w-3 text-primary" />
								<span className="text-xs font-medium text-primary">
									Vous
								</span>
							</span>
						)}
					</h1>
				</div>

				{/* User Profile Card */}
				<Card className="border-border mb-8">
					<CardContent className="p-8">
						<div className="flex flex-col sm:flex-row gap-8">
							{/* Avatar */}
							<div className="flex flex-col items-center gap-4">
								<img
									src={user.avatarUrl}
									alt={`${user.prenom} ${user.nom}`}
									className="h-32 w-32 rounded-full border-4 border-primary/20 object-cover"
								/>
								<div className="text-center">
									<h2 className="text-2xl font-bold text-foreground">
										{user.prenom} {user.nom}
									</h2>
									<p className="text-muted-foreground">
										ID: {user.id}
									</p>
								</div>
							</div>

							{/* User Info */}
							<div className="flex-1 space-y-4">
								{/* Status */}
								<div>
									<p className="text-sm text-muted-foreground mb-2">
										Statut du compte
									</p>
									<div>
										{getStatusBadge(user.accountStatus)}
									</div>
								</div>

								{/* Contact Info */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="flex items-center gap-3">
										<Mail className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">
												Email
											</p>
											<p className="font-medium text-foreground">
												{user.email}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<Phone className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">
												Téléphone
											</p>
											<p className="font-medium text-foreground">
												{user.telephone}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<MapPin className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">
												Ville
											</p>
											<p className="font-medium text-foreground">
												{user.ville}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<Calendar className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">
												Membre depuis
											</p>
											<p className="font-medium text-foreground">
												{formatDate(user.membreDepuis)}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Verification Status */}
				<div className="grid gap-4 md:grid-cols-2 mb-8">
					<Card className="border-border">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground mb-2">
										Identité vérifiée
									</p>
									<p className="text-2xl font-bold text-foreground">
										{user.identiteVerifiee ? "Oui" : "Non"}
									</p>
								</div>
								<div
									className={`flex h-12 w-12 items-center justify-center rounded-lg ${
										user.identiteVerifiee
											? "bg-green-100"
											: "bg-gray-100"
									}`}
								>
									{user.identiteVerifiee ? (
										<CheckCircle2 className="h-6 w-6 text-green-600" />
									) : (
										<AlertCircle className="h-6 w-6 text-gray-600" />
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border-border">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground mb-2">
										Téléphone vérifié
									</p>
									<p className="text-2xl font-bold text-foreground">
										{user.telephoneVerifie ? "Oui" : "Non"}
									</p>
								</div>
								<div
									className={`flex h-12 w-12 items-center justify-center rounded-lg ${
										user.telephoneVerifie
											? "bg-green-100"
											: "bg-gray-100"
									}`}
								>
									{user.telephoneVerifie ? (
										<CheckCircle2 className="h-6 w-6 text-green-600" />
									) : (
										<AlertCircle className="h-6 w-6 text-gray-600" />
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Statistics */}
				<div className="grid gap-4 md:grid-cols-4 mb-8">
					<Card className="border-border">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">
										Note moyenne
									</p>
									<p className="text-3xl font-bold text-foreground mt-2">
										{user.note.toFixed(1)}
									</p>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
									<Star className="h-6 w-6 text-yellow-600" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border-border">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">
										Trajets totaux
									</p>
									<p className="text-3xl font-bold text-foreground mt-2">
										{user.trajetsEffectues}
									</p>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
									<MapPin className="h-6 w-6 text-blue-600" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border-border">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">
										Conducteur
									</p>
									<p className="text-3xl font-bold text-foreground mt-2">
										{user.trajetsEnTantQueConducteur}
									</p>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
									<Shield className="h-6 w-6 text-purple-600" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border-border">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">
										Passager
									</p>
									<p className="text-3xl font-bold text-foreground mt-2">
										{user.trajetsEnTantQuePassager}
									</p>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
									<CheckCircle2 className="h-6 w-6 text-green-600" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Action Buttons */}
				<Card className="border-border mb-8">
					<CardContent className="p-6">
						<h3 className="text-lg font-semibold text-foreground mb-4">
							Actions administrateur
						</h3>
						<div className="flex flex-wrap gap-3">
							<Button
								variant="outline"
								className="gap-2"
								onClick={() => {
									/* Navigate to edit page */
								}}
							>
								<Edit className="h-4 w-4" />
								Modifier le profil
							</Button>

							<Button
								variant="outline"
								className="gap-2"
								onClick={() => {
									/* Open message modal */
								}}
							>
								<MessageSquare className="h-4 w-4" />
								Envoyer un message
							</Button>

							{user.accountStatus === "ACTIVE" && (
								<>
									<Button
										variant="outline"
										className="gap-2 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
										onClick={() =>
											setShowSuspendModal(true)
										}
									>
										<AlertCircle className="h-4 w-4" />
										Suspendre
									</Button>

									<Button
										variant="outline"
										className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
										onClick={() => setShowBanModal(true)}
									>
										<Ban className="h-4 w-4" />
										Bannir
									</Button>
								</>
							)}

							{(user.accountStatus === "SUSPENDED" ||
								user.accountStatus === "BANNED") && (
								<Button
									variant="outline"
									className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
									onClick={handleReactivate}
									disabled={actionLoading}
								>
									<CheckCircle2 className="h-4 w-4" />
									{actionLoading
										? "Réactivation..."
										: "Réactiver le compte"}
								</Button>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Modals */}

				{/* Suspend Modal */}
				{showSuspendModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
						<Card className="border-border w-full max-w-md mx-4">
							<CardContent className="p-6">
								<h2 className="text-xl font-bold text-foreground mb-4">
									Suspendre l'utilisateur
								</h2>
								<p className="text-muted-foreground mb-4">
									Êtes-vous sûr de vouloir suspendre{" "}
									<strong>
										{user.prenom} {user.nom}
									</strong>
									? L'utilisateur ne pourra pas accéder à son
									compte.
								</p>
								<textarea
									placeholder="Raison de la suspension (optionnel)..."
									value={suspendReason}
									onChange={(e) =>
										setSuspendReason(e.target.value)
									}
									className="w-full rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-4"
									rows={3}
								/>
								<div className="flex gap-3">
									<Button
										variant="outline"
										onClick={() =>
											setShowSuspendModal(false)
										}
										disabled={actionLoading}
									>
										Annuler
									</Button>
									<Button
										className="gap-2 bg-yellow-600 hover:bg-yellow-700"
										onClick={handleSuspend}
										disabled={actionLoading}
									>
										<AlertCircle className="h-4 w-4" />
										{actionLoading
											? "Suspension..."
											: "Suspendre"}
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Ban Modal */}
				{showBanModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
						<Card className="border-border w-full max-w-md mx-4">
							<CardContent className="p-6">
								<h2 className="text-xl font-bold text-foreground mb-4">
									Bannir l'utilisateur
								</h2>
								<p className="text-muted-foreground mb-4">
									Êtes-vous sûr de vouloir bannir{" "}
									<strong>
										{user.prenom} {user.nom}
									</strong>
									? Cette action est définitive.
								</p>
								<textarea
									placeholder="Raison du bannissement..."
									value={banReason}
									onChange={(e) =>
										setBanReason(e.target.value)
									}
									className="w-full rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-4"
									rows={3}
									required
								/>
								<div className="flex gap-3">
									<Button
										variant="outline"
										onClick={() => setShowBanModal(false)}
										disabled={actionLoading}
									>
										Annuler
									</Button>
									<Button
										className="gap-2 bg-red-600 hover:bg-red-700"
										onClick={handleBan}
										disabled={actionLoading}
									>
										<Ban className="h-4 w-4" />
										{actionLoading
											? "Bannissement..."
											: "Bannir"}
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</main>
	);
}
