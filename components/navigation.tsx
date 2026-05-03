"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Car } from "lucide-react";

export function Navigation() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-2">
						<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
							<Car className="h-5 w-5 text-primary-foreground" />
						</div>
						<span className="text-xl font-bold text-foreground">
							Covoiturage.tn
						</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden items-center gap-8 md:flex">
						<Link
							href="/"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							Accueil
						</Link>
						<Link
							href="/search"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							Trouver un trajet
						</Link>
						<Link
							href="/offer"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							Proposer un trajet
						</Link>
					</div>

					{/* Desktop Auth Buttons */}
					<div className="hidden items-center gap-3 md:flex">
						<Button variant="ghost" asChild>
							<Link href="/profile">Login</Link>
						</Button>
						<Button asChild>
							<Link href="/profile">Inscription</Link>
						</Button>
					</div>

					{/* Mobile Menu Button */}
					<button
						className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label={
							mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"
						}
					>
						{mobileMenuOpen ? (
							<X className="h-6 w-6" />
						) : (
							<Menu className="h-6 w-6" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="border-t border-border bg-card md:hidden">
					<div className="space-y-1 px-4 py-4">
						<Link
							href="/"
							className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
							onClick={() => setMobileMenuOpen(false)}
						>
							Accueil
						</Link>
						<Link
							href="/search"
							className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
							onClick={() => setMobileMenuOpen(false)}
						>
							Trouver un trajet
						</Link>
						<Link
							href="/offer"
							className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
							onClick={() => setMobileMenuOpen(false)}
						>
							Proposer un trajet
						</Link>
						<div className="flex gap-3 pt-4">
							<Button
								variant="outline"
								className="flex-1"
								asChild
							>
								<Link
									href="/profile"
									onClick={() => setMobileMenuOpen(false)}
								>
									Login
								</Link>
							</Button>
							<Button className="flex-1" asChild>
								<Link
									href="/profile"
									onClick={() => setMobileMenuOpen(false)}
								>
									Inscription
								</Link>
							</Button>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}
