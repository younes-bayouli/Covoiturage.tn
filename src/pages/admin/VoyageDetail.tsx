"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	MapPin,
	Calendar,
	Clock,
	Users,
	DollarSign,
	Phone,
	Mail,
	MessageSquare,
	User,
	Car,
	MapPinIcon,
	AlertCircle,
	CheckCircle2,
	XCircle,
	WifiOff,
	Eye,
	Ban,
	CheckCircle,
	Star,
} from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { Fetch } from "@/hooks/Fetch";

interface Trip {
	id: number;
	depart: string;
	arrivee: string;
	departurePoint: string;
	arrivalPoint: string;
	date: string;
	departureTime: string;
	arrivalTime: string;
	prix: number;
	placesDisponibles: number;
	seats: number;
	status: "upcoming" | "ongoing" | "completed" | "cancelled";
	car: string;
	notes: string;
	stops: string[];
	owner: {
		id: number;
		nom: string;
		prenom: string;
		email: string;
		telephone: string;
		ville: string;
		note: number;
		trajetsEnTantQueConducteur: number;
	};
}

// Mock data for fallback
const mockTrip: Trip = {
	id: 1,
	depart: "Tunis",
	arrivee: "Sfax",
	departurePoint: "Rue de l'Independance, Tunis",
	arrivalPoint: "Place Diwan, Sfax",
	date: "2025-06-15",
	departureTime: "2025-06-15T08:00:00",
	arrivalTime: "2025-06-15T12:30:00",
	prix: 15,
	placesDisponibles: 2,
	seats: 4,
	status: "upcoming",
	car: "Toyota Corolla 2022 - TN 123 ABC",
	notes: "Voyage confortable avec climatisation. Arrêts possibles à demande.",
	stops: ["Sousse", "Sfax"],
	owner: {
		id: 1,
		nom: "Doe",
		prenom: "John",
		email: "john@example.com",
		telephone: "+216 95 123 456",
		ville: "Tunis",
		note: 4.8,
		trajetsEnTantQueConducteur: 12,
	},
};

export function VoyageDetail() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [showContactModal, setShowContactModal] = useState(false);
	const [showDriverModal, setShowDriverModal] = useState(false);
	const [showCancelModal, setShowCancelModal] = useState(false);
	const [showCompleteModal, setShowCompleteModal] = useState(false);
	const [actionLoading, setActionLoading] = useState(false);
	const [cancelReason, setCancelReason] = useState("");

	// Fetch trip data from backend
	const {
		data: response,
		loading,
		error,
		backendUp,
		refetch,
	} = useFetch(
		`http://localhost:8080/admin/trips/${id}`,
		{},
		{
			immediate: true,
			cache: false,
			healthCheck: true,
			fakeData: mockTrip,
		},
	);

	// Extract trip from response
	const trip: Trip = response?.data || response || mockTrip;

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatDateTime = (dateTimeString: string) => {
		return new Date(dateTimeString).toLocaleTimeString("fr-FR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getStatusBadge = (status: string) => {
		const statusConfig: Record<
			string,
			{ bg: string; text: string; icon: React.ReactNode }
		> = {
			upcoming: {
				bg: "bg-blue-100",
				text: "text-blue-800",
				icon: <Clock className="h-5 w-5" />,
			},
			ongoing: {
				bg: "bg-purple-100",
				text: "text-purple-800",
				icon: <MapPin className="h-5 w-5" />,
			},
			completed: {
				bg: "bg-green-100",
				text: "text-green-800",
				icon: <CheckCircle2 className="h-5 w-5" />,
			},
			cancelled: {
				bg: "bg-red-100",
				text: "text-red-800",
				icon: <XCircle className="h-5 w-5" />,
			},
		};

		const config = statusConfig[status] || statusConfig.upcoming;

		return (
			<div
				className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${config.bg} ${config.text}`}
			>
				{config.icon}
				<span className="font-medium">
					{status === "upcoming"
						? "À venir"
						: status === "ongoing"
							? "En cours"
							: status === "completed"
								? "Complété"
								: "Annulé"}
				</span>
			</div>
		);
	};

	const handleCancel = async () => {
		setActionLoading(true);
		try {
			const result = await Fetch(
				`http://localhost:8080/admin/trips/${id}/cancel`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ reason: cancelReason }),
				},
				{
					retries : 0,
					retryDelay: 1000,
					healthCheck: true,
				},
			);

			if (result.success) {
				alert("Voyage annulé avec succès");
				setShowCancelModal(false);
				setCancelReason("");
				refetch();
			} else {
				alert(
					`Erreur lors de l'annulation: ${result.error?.message || "Erreur inconnue"}`,
				);
			}
		} catch (err: any) {
			alert(
				`Erreur lors de l'annulation: ${err.message || "Erreur inconnue"}`,
			);
		} finally {
			setActionLoading(false);
		}
	};

	const handleComplete = async () => {
		setActionLoading(true);
		try {
			const result = await Fetch(
				`http://localhost:8080/admin/trips/${id}/complete`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				},
				{
					retries : 0,
					retryDelay: 1000,
					healthCheck: true,
				},
			);

			if (result.success) {
				alert("Voyage marqué comme complété");
				setShowCompleteModal(false);
				refetch();
			} else {
				alert(
					`Erreur lors de la complétion: ${result.error?.message || "Erreur inconnue"}`,
				);
			}
		} catch (err: any) {
			alert(
				`Erreur lors de la complétion: ${err.message || "Erreur inconnue"}`,
			);
		} finally {
			setActionLoading(false);
		}
	};

	if (loading) {
		return (
			<main className="min-h-screen bg-background">
				<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
					<p className="text-muted-foreground">
						Chargement des détails du voyage...
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
						onClick={() => navigate("/admin/trips")}
						className="gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour
					</Button>
					<h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-foreground">
						Détails du voyage
					</h1>
				</div>

				{/* Trip Route Card */}
				<Card className="border-border mb-8 bg-gradient-to-r from-primary/5 to-primary/10">
					<CardContent className="p-8">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-3xl font-bold text-foreground mb-2">
									{trip.depart} → {trip.arrivee}
								</h2>
								{getStatusBadge(trip.status)}
							</div>
							<div className="text-right">
								<p className="text-sm text-muted-foreground">
									Numéro du voyage
								</p>
								<p className="text-2xl font-bold text-primary">
									#{trip.id}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							<div className="flex items-center gap-3">
								<Calendar className="h-5 w-5 text-primary" />
								<div>
									<p className="text-sm text-muted-foreground">
										Date
									</p>
									<p className="font-medium text-foreground">
										{formatDate(trip.date)}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<Clock className="h-5 w-5 text-primary" />
								<div>
									<p className="text-sm text-muted-foreground">
										Départ
									</p>
									<p className="font-medium text-foreground">
										{formatDateTime(trip.departureTime)}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<Clock className="h-5 w-5 text-primary" />
								<div>
									<p className="text-sm text-muted-foreground">
										Arrivée
									</p>
									<p className="font-medium text-foreground">
										{formatDateTime(trip.arrivalTime)}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<DollarSign className="h-5 w-5 text-primary" />
								<div>
									<p className="text-sm text-muted-foreground">
										Prix par siège
									</p>
									<p className="font-medium text-foreground">
										{trip.prix.toFixed(2)} DT
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Route Details */}
				<div className="grid gap-8 md:grid-cols-2 mb-8">
					{/* Departure Details */}
					<Card className="border-border">
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
								<MapPinIcon className="h-5 w-5 text-primary" />
								Départ
							</h3>
							<div className="space-y-3">
								<div>
									<p className="text-sm text-muted-foreground">
										Ville
									</p>
									<p className="font-medium text-foreground">
										{trip.depart}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Point de départ
									</p>
									<p className="font-medium text-foreground">
										{trip.departurePoint}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Heure
									</p>
									<p className="font-medium text-foreground">
										{formatDateTime(trip.departureTime)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Arrival Details */}
					<Card className="border-border">
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
								<MapPin className="h-5 w-5 text-primary" />
								Arrivée
							</h3>
							<div className="space-y-3">
								<div>
									<p className="text-sm text-muted-foreground">
										Ville
									</p>
									<p className="font-medium text-foreground">
										{trip.arrivee}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Point d'arrivée
									</p>
									<p className="font-medium text-foreground">
										{trip.arrivalPoint}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Heure estimée
									</p>
									<p className="font-medium text-foreground">
										{formatDateTime(trip.arrivalTime)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Stops and Notes */}
				<div className="grid gap-8 md:grid-cols-2 mb-8">
					{/* Stops */}
					<Card className="border-border">
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
								<MapPin className="h-5 w-5 text-primary" />
								Arrêts prévus
							</h3>
							{trip.stops && trip.stops.length > 0 ? (
								<div className="space-y-2">
									{trip.stops.map((stop, idx) => (
										<div
											key={idx}
											className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
										>
											<div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
												{idx + 1}
											</div>
											<span className="font-medium text-foreground">
												{stop}
											</span>
										</div>
									))}
								</div>
							) : (
								<p className="text-muted-foreground">
									Aucun arrêt prévu
								</p>
							)}
						</CardContent>
					</Card>

					{/* Notes */}
					<Card className="border-border">
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold text-foreground mb-4">
								Remarques
							</h3>
							{trip.notes ? (
								<p className="text-foreground whitespace-pre-wrap">
									{trip.notes}
								</p>
							) : (
								<p className="text-muted-foreground">
									Aucune remarque
								</p>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Vehicle Info */}
				<Card className="border-border mb-8">
					<CardContent className="p-6">
						<h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
							<Car className="h-5 w-5 text-primary" />
							Véhicule
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">
									Modèle et immatriculation
								</p>
								<p className="font-medium text-foreground">
									{trip.car}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Seats Info */}
				<Card className="border-border mb-8">
					<CardContent className="p-6">
						<h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
							<Users className="h-5 w-5 text-primary" />
							Places disponibles
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">
									Total des places
								</p>
								<p className="text-3xl font-bold text-foreground">
									{trip.seats}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									Places disponibles
								</p>
								<p className="text-3xl font-bold text-green-600">
									{trip.placesDisponibles}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									Places réservées
								</p>
								<p className="text-3xl font-bold text-primary">
									{trip.seats - trip.placesDisponibles}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Driver Card */}
				<Card className="border-border mb-8 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/20 dark:to-blue-950/20">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
								<User className="h-5 w-5 text-primary" />
								Conducteur
							</h3>
							<div className="flex items-center gap-2">
								<Star className="h-5 w-5 text-yellow-500" />
								<span className="font-semibold text-foreground">
									{trip.owner.note.toFixed(1)}
								</span>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<div>
								<p className="text-sm text-muted-foreground">
									Nom
								</p>
								<p className="text-lg font-semibold text-foreground">
									{trip.owner.prenom} {trip.owner.nom}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									Trajets effectués
								</p>
								<p className="text-lg font-semibold text-foreground">
									{trip.owner.trajetsEnTantQueConducteur}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Mail className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">
										Email
									</p>
									<p className="font-medium text-foreground">
										{trip.owner.email}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Phone className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">
										Téléphone
									</p>
									<p className="font-medium text-foreground">
										{trip.owner.telephone}
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

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
								onClick={() => setShowContactModal(true)}
							>
								<MessageSquare className="h-4 w-4" />
								Contacter le conducteur
							</Button>

							<Button
								variant="outline"
								className="gap-2"
								onClick={() => setShowDriverModal(true)}
							>
								<Eye className="h-4 w-4" />
								Détails du conducteur
							</Button>

							{trip.status === "upcoming" && (
								<Button
									variant="outline"
									className="gap-2"
									onClick={() => setShowCompleteModal(true)}
								>
									<CheckCircle className="h-4 w-4" />
									Marquer comme complété
								</Button>
							)}

							{trip.status !== "cancelled" &&
								trip.status !== "completed" && (
									<Button
										variant="outline"
										className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
										onClick={() => setShowCancelModal(true)}
									>
										<Ban className="h-4 w-4" />
										Annuler le voyage
									</Button>
								)}

							<Button
								variant="outline"
								className="gap-2"
								onClick={() =>
									navigate(`/admin/users/${trip.owner.id}`)
								}
							>
								<User className="h-4 w-4" />
								Voir le profil complet
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Modals */}

				{/* Contact Modal */}
				{showContactModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
						<Card className="border-border w-full max-w-md mx-4">
							<CardContent className="p-6">
								<h2 className="text-xl font-bold text-foreground mb-4">
									Contacter le conducteur
								</h2>
								<div className="space-y-4 mb-6">
									<div className="p-4 rounded-lg bg-muted/50">
										<p className="text-sm text-muted-foreground">
											Email
										</p>
										<p className="font-medium text-foreground">
											{trip.owner.email}
										</p>
										<Button
											variant="ghost"
											size="sm"
											className="mt-2 gap-2"
											onClick={() => {
												window.location.href = `mailto:${trip.owner.email}`;
											}}
										>
											<Mail className="h-4 w-4" />
											Ouvrir l'email
										</Button>
									</div>

									<div className="p-4 rounded-lg bg-muted/50">
										<p className="text-sm text-muted-foreground">
											Téléphone
										</p>
										<p className="font-medium text-foreground">
											{trip.owner.telephone}
										</p>
										<Button
											variant="ghost"
											size="sm"
											className="mt-2 gap-2"
											onClick={() => {
												window.location.href = `tel:${trip.owner.telephone}`;
											}}
										>
											<Phone className="h-4 w-4" />
											Appeler
										</Button>
									</div>
								</div>
								<Button
									onClick={() => setShowContactModal(false)}
									className="w-full"
								>
									Fermer
								</Button>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Driver Details Modal */}
				{showDriverModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
						<Card className="border-border w-full max-w-md mx-4">
							<CardContent className="p-6">
								<h2 className="text-xl font-bold text-foreground mb-4">
									{trip.owner.prenom} {trip.owner.nom}
								</h2>
								<div className="space-y-4 mb-6">
									<div className="flex items-center justify-between">
										<p className="text-sm text-muted-foreground">
											Note moyenne
										</p>
										<div className="flex items-center gap-2">
											<Star className="h-5 w-5 text-yellow-500" />
											<span className="font-bold text-foreground">
												{trip.owner.note.toFixed(1)}
											</span>
										</div>
									</div>

									<div className="flex items-center justify-between">
										<p className="text-sm text-muted-foreground">
											Trajets effectués
										</p>
										<p className="font-bold text-foreground">
											{
												trip.owner
													.trajetsEnTantQueConducteur
											}
										</p>
									</div>

									<div className="flex items-center justify-between">
										<p className="text-sm text-muted-foreground">
											Ville
										</p>
										<p className="font-medium text-foreground">
											{trip.owner.ville}
										</p>
									</div>

									<hr className="my-4" />

									<Button
										onClick={() =>
											navigate(
												`/admin/users/${trip.owner.id}`,
											)
										}
										className="w-full gap-2"
									>
										<Eye className="h-4 w-4" />
										Voir le profil complet
									</Button>
								</div>
								<Button
									variant="outline"
									onClick={() => setShowDriverModal(false)}
									className="w-full"
								>
									Fermer
								</Button>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Cancel Modal */}
				{showCancelModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
						<Card className="border-border w-full max-w-md mx-4">
							<CardContent className="p-6">
								<h2 className="text-xl font-bold text-foreground mb-4">
									Annuler le voyage
								</h2>
								<p className="text-muted-foreground mb-4">
									Êtes-vous sûr de vouloir annuler ce voyage
									de{" "}
									<strong>
										{trip.depart} → {trip.arrivee}
									</strong>
									?
								</p>
								<textarea
									placeholder="Raison de l'annulation..."
									value={cancelReason}
									onChange={(e) =>
										setCancelReason(e.target.value)
									}
									className="w-full rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-4"
									rows={3}
									required
								/>
								<div className="flex gap-3">
									<Button
										variant="outline"
										onClick={() =>
											setShowCancelModal(false)
										}
										disabled={actionLoading}
									>
										Annuler
									</Button>
									<Button
										className="gap-2 bg-red-600 hover:bg-red-700"
										onClick={handleCancel}
										disabled={actionLoading}
									>
										<Ban className="h-4 w-4" />
										{actionLoading
											? "Annulation..."
											: "Annuler le voyage"}
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Complete Modal */}
				{showCompleteModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
						<Card className="border-border w-full max-w-md mx-4">
							<CardContent className="p-6">
								<h2 className="text-xl font-bold text-foreground mb-4">
									Marquer comme complété
								</h2>
								<p className="text-muted-foreground mb-6">
									Êtes-vous sûr de vouloir marquer ce voyage
									comme complété?
								</p>
								<div className="flex gap-3">
									<Button
										variant="outline"
										onClick={() =>
											setShowCompleteModal(false)
										}
										disabled={actionLoading}
									>
										Annuler
									</Button>
									<Button
										className="gap-2 bg-green-600 hover:bg-green-700"
										onClick={handleComplete}
										disabled={actionLoading}
									>
										<CheckCircle className="h-4 w-4" />
										{actionLoading
											? "Traitement..."
											: "Confirmer"}
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
