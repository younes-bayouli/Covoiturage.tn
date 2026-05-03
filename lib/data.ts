// Tunisian cities
export const cities = [
	"Tunis",
	"Sfax",
	"Sousse",
	"Monastir",
	"Gabes",
	"Kairouan",
	"Bizerte",
	"Nabeul",
] as const;

export type City = (typeof cities)[number];

// Driver data
export interface Driver {
	id: string;
	name: string;
	avatar: string;
	city: City;
	rating: number;
	tripsCompleted: number;
	memberSince: string;
	idVerified: boolean;
	phoneVerified: boolean;
	car: string;
	bio: string;
}

export const drivers: Driver[] = [
	{
		id: "1",
		name: "Yassine Ben Ali",
		avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
		city: "Tunis",
		rating: 4.8,
		tripsCompleted: 127,
		memberSince: "Mars 2023",
		idVerified: true,
		phoneVerified: true,
		car: "Volkswagen Golf 7",
		bio: "Conducteur regulier Tunis-Sfax. Ponctuel et sympathique!",
	},
	{
		id: "2",
		name: "Sarra Hamdi",
		avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
		city: "Sfax",
		rating: 4.6,
		tripsCompleted: 89,
		memberSince: "Juin 2023",
		idVerified: true,
		phoneVerified: true,
		car: "Peugeot 308",
		bio: "Je fais souvent le trajet Sfax-Sousse. Bonne musique garantie!",
	},
	{
		id: "3",
		name: "Mohamed Trabelsi",
		avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
		city: "Sousse",
		rating: 4.9,
		tripsCompleted: 203,
		memberSince: "Janvier 2022",
		idVerified: true,
		phoneVerified: true,
		car: "Renault Megane",
		bio: "Expert des routes tunisiennes. Climatisation toujours en marche!",
	},
];

// Ride data
export interface Ride {
	id: string;
	driverId: string;
	from: City;
	to: City;
	departurePoint: string;
	arrivalPoint: string;
	date: string;
	time: string;
	duration: string;
	price: number;
	availableSeats: number;
	totalSeats: number;
	stops?: string[];
}

export const rides: Ride[] = [
	{
		id: "1",
		driverId: "1",
		from: "Tunis",
		to: "Sfax",
		departurePoint: "Station Bab Saadoun",
		arrivalPoint: "Centre-ville Sfax",
		date: "Samedi 19 Avril",
		time: "08h30",
		duration: "2h45",
		price: 15,
		availableSeats: 2,
		totalSeats: 4,
		stops: ["Sousse"],
	},
	{
		id: "2",
		driverId: "2",
		from: "Sfax",
		to: "Sousse",
		departurePoint: "Gare routiere Sfax",
		arrivalPoint: "Port El Kantaoui",
		date: "Dimanche 20 Avril",
		time: "10h00",
		duration: "1h30",
		price: 10,
		availableSeats: 3,
		totalSeats: 4,
	},
	{
		id: "3",
		driverId: "3",
		from: "Sousse",
		to: "Tunis",
		departurePoint: "Sousse Medina",
		arrivalPoint: "Lac 2, Tunis",
		date: "Lundi 21 Avril",
		time: "07h00",
		duration: "2h00",
		price: 12,
		availableSeats: 1,
		totalSeats: 3,
	},
	{
		id: "4",
		driverId: "1",
		from: "Tunis",
		to: "Monastir",
		departurePoint: "Aeroport Tunis-Carthage",
		arrivalPoint: "Aeroport Monastir",
		date: "Mardi 22 Avril",
		time: "14h00",
		duration: "2h15",
		price: 18,
		availableSeats: 4,
		totalSeats: 4,
	},
	{
		id: "5",
		driverId: "2",
		from: "Kairouan",
		to: "Tunis",
		departurePoint: "Mosquee Okba",
		arrivalPoint: "Centre-ville Tunis",
		date: "Mercredi 23 Avril",
		time: "06h30",
		duration: "2h30",
		price: 14,
		availableSeats: 2,
		totalSeats: 4,
		stops: ["Enfidha"],
	},
	{
		id: "6",
		driverId: "3",
		from: "Bizerte",
		to: "Tunis",
		departurePoint: "Port de Bizerte",
		arrivalPoint: "La Marsa",
		date: "Jeudi 24 Avril",
		time: "09h00",
		duration: "1h15",
		price: 8,
		availableSeats: 3,
		totalSeats: 4,
	},
];

// Reviews
export interface Review {
	id: string;
	authorName: string;
	authorAvatar: string;
	rating: number;
	comment: string;
	date: string;
	tripRoute: string;
}

export const reviews: Review[] = [
	{
		id: "1",
		authorName: "Amira Bouazizi",
		authorAvatar:
			"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
		rating: 5,
		comment:
			"Excellent voyage! Yassine est tres ponctuel et la voiture etait propre. Je recommande!",
		date: "15 Avril 2024",
		tripRoute: "Tunis - Sfax",
	},
	{
		id: "2",
		authorName: "Karim Jebali",
		authorAvatar:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
		rating: 5,
		comment:
			"Super trajet avec Mohamed. Tres agreable et bonne conversation. La clim marchait parfaitement!",
		date: "12 Avril 2024",
		tripRoute: "Sousse - Tunis",
	},
	{
		id: "3",
		authorName: "Leila Mansouri",
		authorAvatar:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
		rating: 4,
		comment:
			"Bon voyage avec Sarra. Petit retard au depart mais sinon tout etait bien.",
		date: "10 Avril 2024",
		tripRoute: "Sfax - Sousse",
	},
];

// Testimonials for landing page
export const testimonials = [
	{
		name: "Fatma Ben Salem",
		city: "Tunis",
		avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
		comment:
			"Grace a Covoiturage.tn, je fais des economies chaque semaine sur mon trajet Tunis-Sousse. En plus, j'ai rencontre des gens formidables!",
	},
	{
		name: "Ahmed Chaabane",
		city: "Sfax",
		avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
		comment:
			"En tant que conducteur, Covoiturage.tn m'aide a rentabiliser mes trajets. L'application est simple et les passagers sont toujours sympas.",
	},
	{
		name: "Nadia Gharbi",
		city: "Monastir",
		avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
		comment:
			"Fini les louages bondes! Avec Covoiturage.tn, je voyage confortablement et en securite. Je ne peux plus m'en passer.",
	},
];

// User trips for profile
export const userTrips = {
	upcoming: [
		{
			id: "u1",
			from: "Tunis",
			to: "Sfax",
			date: "Samedi 19 Avril",
			time: "08h30",
			role: "passenger" as const,
			driverName: "Yassine Ben Ali",
		},
		{
			id: "u2",
			from: "Sousse",
			to: "Monastir",
			date: "Dimanche 27 Avril",
			time: "15h00",
			role: "driver" as const,
			passengers: 2,
		},
	],
	past: [
		{
			id: "p1",
			from: "Tunis",
			to: "Sousse",
			date: "Samedi 5 Avril",
			time: "09h00",
			role: "passenger" as const,
			driverName: "Mohamed Trabelsi",
		},
		{
			id: "p2",
			from: "Sfax",
			to: "Gabes",
			date: "Dimanche 30 Mars",
			time: "11h00",
			role: "driver" as const,
			passengers: 3,
		},
		{
			id: "p3",
			from: "Nabeul",
			to: "Tunis",
			date: "Samedi 22 Mars",
			time: "07h30",
			role: "passenger" as const,
			driverName: "Sarra Hamdi",
		},
	],
};

// Helper function to get driver by id
export function getDriverById(id: string): Driver | undefined {
	return drivers.find((d) => d.id === id);
}

// Helper function to get ride by id
export function getRideById(id: string): Ride | undefined {
	return rides.find((r) => r.id === id);
}

// Helper function to get reviews for a driver
export function getReviewsForDriver(driverId: string): Review[] {
	// In a real app, this would filter by driverId
	return reviews;
}
