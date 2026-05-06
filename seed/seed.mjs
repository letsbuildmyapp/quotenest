// Seeds the local Firestore emulator with realistic demo leads.
// Usage: `npm run seed` (after `npm run emulators` is running in another terminal).

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, addDoc, collection } from 'firebase/firestore';

const app = initializeApp({ projectId: 'quotenest-demo', apiKey: 'demo' });
const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8080);

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

const SAMPLES = [
  {
    name: 'Maya Goldberg', email: 'maya.g@example.com', phone: '(415) 555-0142', zip: '94110',
    answers: { home_type: 'single_family', ownership: 'own', monthly_bill: 320, roof_age: 'new', roof_shading: 'full', usage_pattern: ['ev', 'heat_pump'], battery: 'yes', timeline: 'asap' },
    score: 'hot', scoreValue: 92, status: 'new', estimate: { low: 19500, high: 25400, systemSizeKw: 9.2, panelCount: 23, annualSavings: 3530, paybackYears: 6.4, incentiveDollars: 9600, breakdown: [] },
  },
  {
    name: 'Theo Park', email: 'theo@parkhouse.io', phone: '(206) 555-2210', zip: '98115',
    answers: { home_type: 'single_family', ownership: 'own', monthly_bill: 220, roof_age: 'mid', roof_shading: 'partial', usage_pattern: ['ev'], battery: 'maybe', timeline: 'three_months' },
    score: 'hot', scoreValue: 78, status: 'contacted', estimate: { low: 14800, high: 19200, systemSizeKw: 7.5, panelCount: 19, annualSavings: 2068, paybackYears: 8.2, incentiveDollars: 6600, breakdown: [] },
  },
  {
    name: 'Priya Vasudevan', email: 'priya.v@gmail.com', phone: '(512) 555-9981', zip: '78704',
    answers: { home_type: 'single_family', ownership: 'own', monthly_bill: 180, roof_age: 'old', roof_shading: 'full', usage_pattern: ['heat_pump', 'pool'], battery: 'yes', timeline: 'this_year' },
    score: 'warm', scoreValue: 64, status: 'qualified', estimate: { low: 23200, high: 29800, systemSizeKw: 8.1, panelCount: 21, annualSavings: 1985, paybackYears: 13.4, incentiveDollars: 11000, breakdown: [] },
  },
  {
    name: 'Jordan Brooks', email: 'jordan@brooksmail.com', phone: '(704) 555-8081', zip: '28204',
    answers: { home_type: 'townhouse', ownership: 'own', monthly_bill: 95, roof_age: 'mid', roof_shading: 'mostly_shaded', usage_pattern: ['none'], battery: 'no', timeline: 'researching' },
    score: 'cold', scoreValue: 22, status: 'lost', estimate: { low: 6400, high: 8200, systemSizeKw: 4.0, panelCount: 10, annualSavings: 460, paybackYears: 15.9, incentiveDollars: 2900, breakdown: [] },
  },
  {
    name: 'Ana Rios', email: 'ana.rios@example.com', phone: '(602) 555-7733', zip: '85016',
    answers: { home_type: 'single_family', ownership: 'own', monthly_bill: 410, roof_age: 'new', roof_shading: 'full', usage_pattern: ['ev', 'pool', 'heat_pump'], battery: 'yes', timeline: 'asap' },
    score: 'hot', scoreValue: 96, status: 'won', estimate: { low: 28700, high: 36400, systemSizeKw: 11.2, panelCount: 28, annualSavings: 4530, paybackYears: 7.1, incentiveDollars: 13800, breakdown: [] },
  },
  {
    name: 'Sam Ng', email: 'sng@example.org', phone: '(415) 555-0011', zip: '94117',
    answers: { home_type: 'single_family', ownership: 'buying', monthly_bill: 130, roof_age: 'unknown', roof_shading: 'partial', usage_pattern: ['ev'], battery: 'maybe', timeline: 'three_months' },
    score: 'warm', scoreValue: 55, status: 'new', estimate: { low: 11200, high: 14800, systemSizeKw: 6.0, panelCount: 15, annualSavings: 1230, paybackYears: 10.6, incentiveDollars: 4900, breakdown: [] },
  },
  {
    name: 'Dakota Lewis', email: 'dakota.l@example.com', phone: '(720) 555-4421', zip: '80206',
    answers: { home_type: 'single_family', ownership: 'own', monthly_bill: 250, roof_age: 'mid', roof_shading: 'full', usage_pattern: ['ev', 'addition'], battery: 'yes', timeline: 'asap' },
    score: 'hot', scoreValue: 86, status: 'qualified', estimate: { low: 21900, high: 28100, systemSizeKw: 9.0, panelCount: 23, annualSavings: 2820, paybackYears: 8.9, incentiveDollars: 10400, breakdown: [] },
  },
  {
    name: 'Lena Holm', email: 'lena.h@example.com', phone: '(503) 555-6602', zip: '97214',
    answers: { home_type: 'single_family', ownership: 'own', monthly_bill: 145, roof_age: 'old', roof_shading: 'partial', usage_pattern: ['heat_pump'], battery: 'no', timeline: 'this_year' },
    score: 'warm', scoreValue: 48, status: 'contacted', estimate: { low: 14400, high: 18900, systemSizeKw: 6.6, panelCount: 17, annualSavings: 1480, paybackYears: 11.3, incentiveDollars: 6500, breakdown: [] },
  },
];

const NOW = Date.now();
let i = 0;
for (const sample of SAMPLES) {
  const lead = {
    id: uid('lead'),
    createdAt: NOW - i * 1000 * 60 * 60 * 7,
    updatedAt: NOW - i * 1000 * 60 * 30,
    source: 'seed',
    ...sample,
  };
  await addDoc(collection(db, 'leads'), lead);
  i++;
  // eslint-disable-next-line no-console
  console.log(`Seeded: ${lead.name} (${lead.score})`);
}

console.log(`\n✅ Seeded ${SAMPLES.length} leads into the Firestore emulator.\n`);
process.exit(0);
