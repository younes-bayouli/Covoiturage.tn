"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Car, Menu, X, User, Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// @ts-ignore
import { useAuth } from "../context/authContext";

const navLinks = [
	{ href: "/search", label: "Trouver un trajet", icon: Search },
	{ href: "/offer", label: "Proposer un trajet", icon: PlusCircle },
	{ href: "/profile", label: "Mon Profil", icon: User },
];

export function Navigation() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const location = useLocation();
	const {isLoggedIn:isLoggedin} = useAuth();

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-white">
			<nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
				{/* Logo */}
				<Link to="/" className="flex items-center gap-2">
					<img
						style={{ height: 45 }}
						src="public\Untitled (1).png"
						alt=""
					/>
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden items-center gap-1 lg:flex">
					{navLinks.map((link) => {
						const Icon = link.icon;
						const isActive = location.pathname === link.href;
						return (
							<Link
								key={link.href}
								to={link.href}
								className={cn(
									"flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
									isActive
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-muted hover:text-foreground",
								)}
							>
								<Icon className="h-4 w-4" />
								{link.label}
							</Link>
						);
					})}
				</div>
				{!isLoggedin && (
					<div className="hidden lg:flex lg:items-center lg:gap-3">
						<Link to="/login">
							<Button variant="outline" size="sm">
								LogIn
							</Button>
						</Link>
						<Link to="/signin">
							<Button
								size="sm"
								className="bg-accent text-accent-foreground hover:bg-accent/90"
							>
								SignIn
							</Button>
						</Link>
					</div>
				)}
				<button
					type="button"
					className="lg:hidden rounded-md p-2 text-foreground"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
				>
					{mobileMenuOpen ? (
						<X className="h-6 w-6" />
					) : (
						<Menu className="h-6 w-6" />
					)}
				</button>
			</nav>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="lg:hidden border-t border-border bg-background">
					<div className="space-y-1 px-4 py-3">
						{navLinks.map((link) => {
							const Icon = link.icon;
							const isActive = location.pathname === link.href;
							return (
								<Link
									key={link.href}
									to={link.href}
									onClick={() => setMobileMenuOpen(false)}
									className={cn(
										"flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
										isActive
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:bg-muted hover:text-foreground",
									)}
								>
									<Icon className="h-5 w-5" />
									{link.label}
								</Link>
							);
						})}
						<div className="flex gap-3 pt-4">
							<Link
								to="/Login"
								className="flex-1"
								onClick={() => setMobileMenuOpen(false)}
							>
								<Button variant="outline" className="w-full">
									Login
								</Button>
							</Link>
							<Link
								to="/inscription"
								className="flex-1"
								onClick={() => setMobileMenuOpen(false)}
							>
								<Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
									Inscription
								</Button>
							</Link>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
