"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Search,
	Shield,
	Wallet,
	Leaf,
	MapPin,
	Calendar,
	Users,
	Star,
	ArrowRight,
	ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cities, testimonials } from "@/lib/data";

export function HomePage() {
	const navigate = useNavigate();
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	const [date, setDate] = useState("");
	const [passengers, setPassengers] = useState("1");

	const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const params = new URLSearchParams();
		if (from) params.set("depart", from);
		if (to) params.set("arrivee", to);
		if (date) params.set("date", date);
		if (passengers) params.set("nbrPassagers", passengers);
		navigate(`/search?${params.toString()}`);
	};

	useEffect(() => {
		localStorage.removeItem("loggingout");
	}, []);

	return (
		<main>
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
				<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
					<div className="flex items-center" style={{"position":"relative"}}>
						<div className="text-center">
							<h1 className="font-[family-name:var(--font-display)] text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
								Voyagez ensemble,
								<span className="block text-primary">
									economisez ensemble
								</span>
							</h1>
							<p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
								Rejoignez la premiere communaute de covoiturage
								en Tunisie. Partagez vos trajets, reduisez vos
								frais et rencontrez des voyageurs comme vous.
							</p>
						</div>

						<div
							className="bg-black/25 h-100 mx-8"
							style={{ width: 0 }}
						></div>
						<div style={{ "height":100,"position":"absolute", "right":"37%","top":"8%"}}>
							<img style={{"height":"100%","width":"100%"}} src="public/arrow.png" alt="" />
						</div>

						{/* Search Form */}
						{/* Updated Card: Added flex-1 to grow and mx-6 for medium margin */}
						<Card className="mt-0 flex-1 mx-6 border-border shadow-lg">
							<CardContent className="flex flex-col p-6">
								<form
									onSubmit={handleSearch}
									/* grid-cols-1 keeps it vertical */
									className="grid grid-cols-1 gap-4"
								>
									{/* From */}
									<div className="relative">
										<label className="mb-1.5 block text-sm font-medium text-foreground">
											Depart
										</label>
										<div className="relative">
											<MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<select
												value={from}
												onChange={(e) =>
													setFrom(e.target.value)
												}
												className="h-11 w-full appearance-none rounded-lg border border-input bg-background pl-10 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
											>
												<option value="">
													Ville de depart
												</option>
												{cities.map((city) => (
													<option
														key={city}
														value={city}
													>
														{city}
													</option>
												))}
											</select>
											<ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
										</div>
									</div>

									{/* To */}
									<div className="relative">
										<label className="mb-1.5 block text-sm font-medium text-foreground">
											Arrivee
										</label>
										<div className="relative">
											<MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<select
												value={to}
												onChange={(e) =>
													setTo(e.target.value)
												}
												className="h-11 w-full appearance-none rounded-lg border border-input bg-background pl-10 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
											>
												<option value="">
													Ville d&apos;arrivee
												</option>
												{cities.map((city) => (
													<option
														key={city}
														value={city}
													>
														{city}
													</option>
												))}
											</select>
											<ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
										</div>
									</div>

									{/* Date */}
									<div>
										<label className="mb-1.5 block text-sm font-medium text-foreground">
											Date
										</label>
										<div className="relative">
											<Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<input
												type="date"
												value={date}
												onChange={(e) =>
													setDate(e.target.value)
												}
												className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
											/>
										</div>
									</div>

									{/* Passengers */}
									<div>
										<label className="mb-1.5 block text-sm font-medium text-foreground">
											Passagers
										</label>
										<div className="relative">
											<Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<select
												value={passengers}
												onChange={(e) =>
													setPassengers(
														e.target.value,
													)
												}
												className="h-11 w-full appearance-none rounded-lg border border-input bg-background pl-10 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
											>
												{[1, 2, 3, 4].map((n) => (
													<option key={n} value={n}>
														{n} passager
														{n > 1 ? "s" : ""}
													</option>
												))}
											</select>
											<ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
										</div>
									</div>

									{/* Search Button */}
									<div className="pt-2">
										<Button
											type="submit"
											className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90"
										>
											<Search className="mr-2 h-4 w-4" />
											Rechercher
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="bg-muted/30 py-16 lg:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="font-[family-name:var(--font-display)] text-balance text-3xl font-bold text-foreground sm:text-4xl">
							Pourquoi choisir Covoiturage.tn?
						</h2>
						<p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
							Une plateforme pensee pour les Tunisiens, par des
							Tunisiens
						</p>
					</div>

					<div className="mt-12 grid gap-8 md:grid-cols-3">
						{/* Safe */}
						<Card className="border-border bg-card transition-shadow hover:shadow-md">
							<CardContent className="p-6 text-center">
								<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
									<Shield className="h-7 w-7 text-primary" />
								</div>
								<h3 className="mt-4 text-lg font-semibold text-foreground">
									Securise
								</h3>
								<p className="mt-2 text-sm text-muted-foreground">
									Profils verifies, avis authentiques et
									paiement securise pour voyager en toute
									confiance.
								</p>
							</CardContent>
						</Card>

						{/* Affordable */}
						<Card className="border-border bg-card transition-shadow hover:shadow-md">
							<CardContent className="p-6 text-center">
								<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
									<Wallet className="h-7 w-7 text-accent" />
								</div>
								<h3 className="mt-4 text-lg font-semibold text-foreground">
									Economique
								</h3>
								<p className="mt-2 text-sm text-muted-foreground">
									Partagez les frais de route et economisez
									jusqu&apos;a 70% par rapport aux autres
									transports.
								</p>
							</CardContent>
						</Card>

						{/* Eco */}
						<Card className="border-border bg-card transition-shadow hover:shadow-md">
							<CardContent className="p-6 text-center">
								<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
									<Leaf className="h-7 w-7 text-primary" />
								</div>
								<h3 className="mt-4 text-lg font-semibold text-foreground">
									Ecologique
								</h3>
								<p className="mt-2 text-sm text-muted-foreground">
									Reduisez votre empreinte carbone en
									partageant votre vehicule avec d&apos;autres
									voyageurs.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* How it Works */}
			<section className="py-16 lg:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="font-[family-name:var(--font-display)] text-balance text-3xl font-bold text-foreground sm:text-4xl">
							Comment ca marche?
						</h2>
						<p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
							Trois etapes simples pour commencer votre voyage
						</p>
					</div>

					<div className="mt-12 grid gap-8 md:grid-cols-3">
						{[
							{
								step: "1",
								title: "Recherchez",
								desc: "Entrez votre destination et la date de depart",
							},
							{
								step: "2",
								title: "Reservez",
								desc: "Choisissez le trajet qui vous convient et reservez votre place",
							},
							{
								step: "3",
								title: "Voyagez",
								desc: "Rencontrez votre conducteur et profitez du trajet",
							},
						].map((item) => (
							<div key={item.step} className="text-center">
								<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
									{item.step}
								</div>
								<h3 className="mt-4 text-lg font-semibold text-foreground">
									{item.title}
								</h3>
								<p className="mt-2 text-sm text-muted-foreground">
									{item.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials */}
			<section className="bg-muted/30 py-16 lg:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="font-[family-name:var(--font-display)] text-balance text-3xl font-bold text-foreground sm:text-4xl">
							Ce que disent nos membres
						</h2>
					</div>

					<div className="mt-12 grid gap-8 md:grid-cols-3">
						{testimonials.map((t, i) => (
							<Card key={i} className="border-border bg-card">
								<CardContent className="p-6">
									<div className="flex items-center gap-4">
										<img
											src={t.avatar}
											alt={t.name}
											className="h-12 w-12 rounded-full object-cover"
										/>
										<div>
											<p className="font-semibold text-foreground">
												{t.name}
											</p>
											<p className="text-sm text-muted-foreground">
												{t.city}
											</p>
										</div>
									</div>
									<div className="mt-3 flex gap-0.5">
										{[1, 2, 3, 4, 5].map((star) => (
											<Star
												key={star}
												className="h-4 w-4 fill-accent text-accent"
											/>
										))}
									</div>
									<p className="mt-4 text-sm text-muted-foreground">
										{t.comment}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-16 lg:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<Card className="overflow-hidden border-0 bg-primary">
						<CardContent className="p-8 text-center lg:p-12">
							<h2 className="font-[family-name:var(--font-display)] text-balance text-2xl font-bold text-primary-foreground sm:text-3xl">
								Pret a commencer?
							</h2>
							<p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
								Rejoignez des milliers de Tunisiens qui
								partagent deja leurs trajets sur Covoiturage.tn.
							</p>
							<div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
								<Button
									size="lg"
									className="bg-accent text-accent-foreground hover:bg-accent/90"
									onClick={() => navigate("/search")}
								>
									Trouver un trajet
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
									onClick={() => navigate("/offer")}
								>
									Proposer un trajet
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			
		</main>
	);
}
