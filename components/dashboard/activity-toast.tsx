"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

type Activity = {
  name: string;
  country: string;
  amount: string;
};

// ---- Name pools ----------------------------------------------------------

const usFirstNames = [
  "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph",
  "Thomas", "Charles", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven",
  "Andrew", "Paul", "Joshua", "Kenneth", "Kevin", "Brian", "George", "Timothy",
  "Ronald", "Jason", "Jeffrey", "Ryan", "Mary", "Patricia", "Jennifer", "Linda",
  "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Nancy", "Lisa",
  "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle",
];

const usLastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
];

const germanFirstNames = [
  "Maximilian", "Alexander", "Paul", "Leon", "Jonas", "Felix", "Noah", "Elias",
  "Ben", "Luca", "Finn", "Julian", "Moritz", "Hannes", "Luis", "Simon", "Vincent",
  "Theo", "Oskar", "Anton", "Marie", "Sophie", "Mia", "Emma", "Hanna", "Lena",
  "Anna", "Laura", "Julia", "Sarah", "Katharina", "Clara", "Leonie", "Pia", "Nele",
  "Greta", "Frieda", "Mila", "Lina", "Emilia",
];

const germanLastNames = [
  "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner",
  "Becker", "Schulz", "Hoffmann", "Schäfer", "Koch", "Richter", "Klein", "Wolf",
  "Schrader", "Schwarz", "Zimmer", "König", "Bauer", "Schmitt", "Werner", "Krause",
  "Sander", "Schröder", "Neumann", "Schwarz", "Ziegler", "Frank", "Berger", "Kaiser",
  "Fuchs", "Peters", "Lang", "Scholz", "Möller", "Weiß", "Jung", "Hahn", "Schubert",
];

const europeanFirstNames = [
  // UK
  "Oliver", "Jack", "Harry", "George", "Charlie", "Amelia", "Olivia", "Isla", "Ava", "Emily",
  // France
  "Louis", "Gabriel", "Arthur", "Hugo", "Lucas", "Emma", "Louise", "Amélie", "Camille", "Chloé",
  // Italy
  "Francesco", "Alessandro", "Lorenzo", "Andrea", "Matteo", "Sofia", "Giulia", "Aurora", "Alice", "Ginevra",
  // Spain
  "Hugo", "Martín", "Daniel", "Pablo", "Alejandro", "Lucía", "Sofía", "María", "Martina", "Paula",
  // Netherlands
  "Daan", "Sem", "Levi", "Thijs", "Finn", "Emma", "Tess", "Sophie", "Julia", "Anna",
  // Switzerland / Austria / Scandinavia
  "Noah", "Liam", "Elias", "Oscar", "William", "Maja", "Ella", "Linnea", "Saga", "Astrid",
];

const europeanLastNames = [
  // UK
  "Smith", "Jones", "Taylor", "Brown", "Davies", "Wilson", "Evans", "Thomas", "Roberts", "Walker",
  // France
  "Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent",
  // Italy
  "Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco",
  // Spain
  "García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín",
  // Netherlands
  "de Jong", "Jansen", "de Vries", "van den Berg", "Bakker", "Visser", "Smit", "Meijer", "de Boer", "Mulder",
  // Scandinavia
  "Andersen", "Larsen", "Pedersen", "Nilsen", "Hansen", "Johansson", "Karlsson", "Eriksson", "Larsson", "Olsson",
];

const europeanCountries = [
  "United Kingdom", "France", "Italy", "Spain", "Netherlands", "Switzerland",
  "Sweden", "Norway", "Denmark", "Finland", "Belgium", "Austria", "Ireland",
  "Portugal", "Poland",
];

// ---- Helpers -------------------------------------------------------------

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildPool(): Activity[] {
  const pool: Activity[] = [];

  // 70 US clients
  for (let i = 0; i < 70; i++) {
    pool.push({
      name: `${pick(usFirstNames)} ${pick(usLastNames)}`,
      country: "USA",
      amount: "",
    });
  }

  // 80 German clients
  for (let i = 0; i < 80; i++) {
    pool.push({
      name: `${pick(germanFirstNames)} ${pick(germanLastNames)}`,
      country: "Germany",
      amount: "",
    });
  }

  // 90 European clients (random European country)
  for (let i = 0; i < 90; i++) {
    pool.push({
      name: `${pick(europeanFirstNames)} ${pick(europeanLastNames)}`,
      country: pick(europeanCountries),
      amount: "",
    });
  }

  // Add 40 client activity entries for each country.
  const additionalCountries = [
    "Australia",
    "Canada",
    "Mexico",
    "New Zealand",
    "Italy",
    "Puerto Rico",
    "Cuba",
    "UK",
    "France",
    "Brazil",
    "Japan",
    "India",
    "South Africa",
    "Argentina",
    "Colombia",
    "Chile",
    "Singapore",
    "United Arab Emirates",
  ];

  for (const country of additionalCountries) {
    for (let i = 0; i < 40; i++) {
      pool.push({
        name: `${pick(europeanFirstNames)} ${pick(europeanLastNames)}`,
        country,
        amount: "",
      });
    }
  }

  return pool;
}

function randomAmount(): string {
  // Highest payout is $300,000; generate realistic-looking amounts between $5,000 and $300,000.
  const value = randInt(50, 30000) * 10;
  return `$${value.toLocaleString("en-US")} USD`;
}

// ---- Component -----------------------------------------------------------

const DISPLAY_MS = 5000; // how long a popup stays visible before popping out
const GAP_MS = 15000; // delay between pop-out and next pop-in

export function ActivityToast() {
  const pool = useMemo(buildPool, []);
  const [activity, setActivity] = useState<Activity>(() => ({
    ...pick(pool),
    amount: randomAmount(),
  }));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    let showTimer: ReturnType<typeof setTimeout>;

    function cycle() {
      // Show current activity, then pop out after DISPLAY_MS.
      setVisible(true);
      hideTimer = setTimeout(() => {
        setVisible(false);
        // Wait GAP_MS before showing the next random activity.
        showTimer = setTimeout(() => {
          setActivity({ ...pick(pool), amount: randomAmount() });
          cycle();
        }, GAP_MS);
      }, DISPLAY_MS);
    }

    cycle();

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
    };
  }, [pool]);

  return (
    <div
      className={`pointer-events-auto fixed bottom-5 left-5 z-30 w-[300px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-xl transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={18} className="text-emerald-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Verified Withdrawal
            </span>
            <span className="ml-auto text-[10px] text-slate-400">1 min ago</span>
          </div>
          <p className="mt-0.5 truncate text-[12px] font-semibold text-slate-800">
            {activity.name} from {activity.country}
          </p>
          <p className="mt-0.5 text-[12px] font-bold text-emerald-600">
            Withdrew his payouts {activity.amount}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss notification"
          className="shrink-0 text-slate-300 transition hover:text-slate-500"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
