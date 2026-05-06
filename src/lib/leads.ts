import {
  addDoc, collection, doc, getDocs, onSnapshot, orderBy, query,
  serverTimestamp, Timestamp, updateDoc,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';
import type { Lead, LeadStatus } from '../types';
import { uid } from './utils';

const COLL = 'leads';

export async function createLead(input: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = uid('lead');
  const payload = {
    ...input,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverCreatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COLL), { id, ...payload });
  // Fire follow-up call (don't block)
  try {
    const send = httpsCallable(functions, 'sendQuoteEmail');
    await send({ leadId: id, ...input });
  } catch (e) {
    console.warn('[QuoteNest] Email function call failed (likely emulator without RESEND_API_KEY).', e);
  }
  return { id, docId: ref.id };
}

export async function updateLeadStatus(docId: string, status: LeadStatus) {
  await updateDoc(doc(db, COLL, docId), { status, updatedAt: Date.now() });
}

export async function updateLeadStatusAndOrder(docId: string, status: LeadStatus, order: number) {
  await updateDoc(doc(db, COLL, docId), { status, order, updatedAt: Date.now() });
}

export async function updateLeadNotes(docId: string, notes: string) {
  await updateDoc(doc(db, COLL, docId), { notes, updatedAt: Date.now() });
}

export function subscribeLeads(cb: (leads: (Lead & { _docId: string })[]) => void) {
  const q = query(collection(db, COLL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => {
      const data = d.data() as any;
      const { serverCreatedAt, ...rest } = data;
      void serverCreatedAt;
      return { ...(rest as Lead), _docId: d.id };
    });
    cb(items);
  });
}

export async function fetchLeadsOnce(): Promise<(Lead & { _docId: string })[]> {
  const snap = await getDocs(query(collection(db, COLL), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return { ...(data as Lead), _docId: d.id };
  });
}

export function tsToDate(t: Timestamp | number | undefined): Date {
  if (!t) return new Date();
  if (typeof t === 'number') return new Date(t);
  return t.toDate();
}
