'use server';

import { unstable_noStore as noStore, revalidatePath } from 'next/cache';
import { db } from './firebase-config';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  Timestamp,
  FirestoreDataConverter,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';
import type { Event, Contratante, Artista, Transaction } from './types';

// --- Converters for Firestore ---
const eventConverter: FirestoreDataConverter<Event> = {
  toFirestore: (event: Event): DocumentData => {
    const data: any = { ...event, date: Timestamp.fromDate(new Date(event.date)) };
    if (data.pagar === undefined) delete data.pagar;
    if (data.receber === undefined) delete data.receber;
    return data;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Event => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
      date: (data.date as Timestamp).toDate(),
    } as Event;
  },
};

const contratanteConverter: FirestoreDataConverter<Contratante> = {
  toFirestore: (contratante: Contratante): DocumentData => contratante,
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Contratante => {
    const data = snapshot.data(options);
    return { ...data, id: snapshot.id } as Contratante;
  },
};

const artistaConverter: FirestoreDataConverter<Artista> = {
  toFirestore: (artista: Artista): DocumentData => artista,
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Artista => {
    const data = snapshot.data(options);
    return { ...data, id: snapshot.id } as Artista;
  },
};

const transactionConverter: FirestoreDataConverter<Transaction> = {
  toFirestore: (transaction: Transaction): DocumentData => {
    return { ...transaction, date: Timestamp.fromDate(new Date(transaction.date)) };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Transaction => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
      date: (data.date as Timestamp).toDate(),
    } as Transaction;
  },
};

// --- Collection References ---
const eventsCollection = collection(db, 'events').withConverter(eventConverter);
const contratantesCollection = collection(db, 'contratantes').withConverter(contratanteConverter);
const artistasCollection = collection(db, 'artistas').withConverter(artistaConverter);
const transactionsCollection = collection(db, 'transactions').withConverter(transactionConverter);

// --- Caching ---
// Using unstable_noStore to prevent caching of data fetches.
// This is a dynamic application, so we want fresh data on each request.

// --- Event Functions ---
export async function getEvents(): Promise<Event[]> {
  noStore();
  const q = query(eventsCollection, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

export async function getEventById(id: string): Promise<Event | undefined> {
  noStore();
  const docRef = doc(db, 'events', id).withConverter(eventConverter);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data() : undefined;
}

export async function addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
  const docRef = await addDoc(eventsCollection, eventData as Event);
  revalidatePath('/');
  return { id: docRef.id, ...eventData };
}

export async function updateEvent(id: string, eventData: Partial<Omit<Event, 'id'>>): Promise<void> {
  const docRef = doc(db, 'events', id);
  const cleanData = Object.fromEntries(Object.entries(eventData).filter(([_, v]) => v !== undefined));
  await updateDoc(docRef, cleanData);
  revalidatePath('/');
  revalidatePath(`/events/${id}`);
}

export async function deleteEvent(id: string): Promise<void> {
  const docRef = doc(db, 'events', id);
  await deleteDoc(docRef);
  revalidatePath('/');
}

// --- Contratante Functions ---
export async function getContratantes(): Promise<Contratante[]> {
  noStore();
  const q = query(contratantesCollection, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

export async function addContratante(contratanteData: Omit<Contratante, 'id'>): Promise<Contratante> {
  const docRef = await addDoc(contratantesCollection, contratanteData as Contratante);
  revalidatePath('/contratantes');
  return { id: docRef.id, ...contratanteData };
}

export async function updateContratante(id: string, contratanteData: Partial<Omit<Contratante, 'id'>>): Promise<void> {
  const oldContratante = await getDoc(doc(db, 'contratantes', id));
  const oldName = oldContratante.data()?.name;
  const newName = contratanteData.name;

  const batch = writeBatch(db);
  const contratanteRef = doc(db, 'contratantes', id);
  batch.update(contratanteRef, contratanteData);

  if (newName && oldName !== newName) {
    const eventsQuery = query(eventsCollection, where('contratante', '==', oldName));
    const eventsSnapshot = await getDocs(eventsQuery);
    eventsSnapshot.forEach(eventDoc => {
      const eventRef = doc(db, 'events', eventDoc.id);
      batch.update(eventRef, { contratante: newName });
    });
  }
  await batch.commit();
  revalidatePath('/contratantes');
  revalidatePath('/');
}

export async function deleteContratante(id: string): Promise<void> {
  const docRef = doc(db, 'contratantes', id);
  await deleteDoc(docRef);
  revalidatePath('/contratantes');
  revalidatePath('/');
}

// --- Artista Functions ---
export async function getArtistas(): Promise<Artista[]> {
  noStore();
  const q = query(artistasCollection, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

export async function addArtista(artistaData: Omit<Artista, 'id'>): Promise<Artista> {
  const docRef = await addDoc(artistasCollection, artistaData as Artista);
  revalidatePath('/artistas');
  return { id: docRef.id, ...artistaData };
}

export async function updateArtista(id: string, artistaData: Partial<Omit<Artista, 'id'>>): Promise<void> {
  const oldArtista = await getDoc(doc(db, 'artistas', id));
  const oldName = oldArtista.data()?.name;
  const newName = artistaData.name;

  const batch = writeBatch(db);
  const artistaRef = doc(db, 'artistas', id);
  batch.update(artistaRef, artistaData);

  if (newName && oldName !== newName) {
    const eventsQuery = query(eventsCollection, where('artista', '==', oldName));
    const eventsSnapshot = await getDocs(eventsQuery);
    eventsSnapshot.forEach(eventDoc => {
      const eventRef = doc(db, 'events', eventDoc.id);
      batch.update(eventRef, { artista: newName });
    });
  }
  await batch.commit();
  revalidatePath('/artistas');
  revalidatePath('/');
}

export async function deleteArtista(id: string): Promise<void> {
  const docRef = doc(db, 'artistas', id);
  await deleteDoc(docRef);
  revalidatePath('/artistas');
  revalidatePath('/');
}

// --- Transaction Functions ---
export async function getTransactions(): Promise<Transaction[]> {
  noStore();
  const q = query(transactionsCollection, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

export async function addTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
  const docRef = await addDoc(transactionsCollection, transactionData as Transaction);
  revalidatePath('/transacoes');
  revalidatePath('/financeiro');
  return { id: docRef.id, ...transactionData };
}

export async function updateTransaction(id: string, transactionData: Partial<Omit<Transaction, 'id'>>): Promise<void> {
  const docRef = doc(db, 'transactions', id);
  const cleanData = Object.fromEntries(Object.entries(transactionData).filter(([_, v]) => v !== undefined));
  if (cleanData.date) {
    cleanData.date = Timestamp.fromDate(new Date(cleanData.date));
  }
  await updateDoc(docRef, cleanData);
  revalidatePath('/transacoes');
  revalidatePath('/financeiro');
}

export async function deleteTransaction(id: string): Promise<void> {
  const docRef = doc(db, 'transactions', id);
  await deleteDoc(docRef);
  revalidatePath('/transacoes');
  revalidatePath('/financeiro');
}
