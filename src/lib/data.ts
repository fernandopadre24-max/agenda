'use server';

import { unstable_noStore as noStore, revalidatePath } from 'next/cache';
import { cache } from 'react';
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


// --- Event Functions ---
export const getEvents = cache(async (): Promise<Event[]> => {
  const q = query(eventsCollection, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
});

export const getEventById = cache(async (id: string): Promise<Event | undefined> => {
  const docRef = doc(db, 'events', id).withConverter(eventConverter);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data() : undefined;
});

export async function addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
  const docRef = await addDoc(eventsCollection, eventData as Event);
  return { id: docRef.id, ...eventData };
}

export async function updateEvent(id: string, eventData: Partial<Omit<Event, 'id'>>): Promise<void> {
  const docRef = doc(db, 'events', id);
  const cleanData = Object.fromEntries(Object.entries(eventData).filter(([_, v]) => v !== undefined));
  await updateDoc(docRef, cleanData);
}

export async function deleteEvent(id: string): Promise<void> {
  const docRef = doc(db, 'events', id);
  await deleteDoc(docRef);
}

// --- Contratante Functions ---
export const getContratantes = cache(async (): Promise<Contratante[]> => {
  const q = query(contratantesCollection, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
});

export async function addContratante(contratanteData: Omit<Contratante, 'id'>): Promise<Contratante> {
  const docRef = await addDoc(contratantesCollection, contratanteData as Contratante);
  return { id: docRef.id, ...contratanteData };
}

export async function updateContratante(id: string, contratanteData: Partial<Omit<Contratante, 'id'>>): Promise<void> {
  const oldContratanteSnapshot = await getDoc(doc(db, 'contratantes', id));
  if (!oldContratanteSnapshot.exists()) {
    throw new Error("Contratante não encontrado");
  }
  const oldName = oldContratanteSnapshot.data()?.name;
  const newName = contratanteData.name;

  const batch = writeBatch(db);
  const contratanteRef = doc(db, 'contratantes', id);
  batch.update(contratanteRef, contratanteData);

  if (newName && oldName && oldName !== newName) {
    const eventsQuery = query(eventsCollection, where('contratante', '==', oldName));
    const eventsSnapshot = await getDocs(eventsQuery);
    eventsSnapshot.forEach(eventDoc => {
      const eventRef = doc(db, 'events', eventDoc.id);
      batch.update(eventRef, { contratante: newName });
    });
  }
  await batch.commit();
}

export async function deleteContratante(id: string): Promise<void> {
  const docRef = doc(db, 'contratantes', id);
  await deleteDoc(docRef);
}

// --- Artista Functions ---
export const getArtistas = cache(async (): Promise<Artista[]> => {
  const q = query(artistasCollection, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
});

export async function addArtista(artistaData: Omit<Artista, 'id'>): Promise<Artista> {
  const docRef = await addDoc(artistasCollection, artistaData as Artista);
  return { id: docRef.id, ...artistaData };
}

export async function updateArtista(id: string, artistaData: Partial<Omit<Artista, 'id'>>): Promise<void> {
  const oldArtistaSnapshot = await getDoc(doc(db, 'artistas', id));
   if (!oldArtistaSnapshot.exists()) {
    throw new Error("Artista não encontrado");
  }
  const oldName = oldArtistaSnapshot.data()?.name;
  const newName = artistaData.name;

  const batch = writeBatch(db);
  const artistaRef = doc(db, 'artistas', id);
  batch.update(artistaRef, artistaData);

  if (newName && oldName && oldName !== newName) {
    const eventsQuery = query(eventsCollection, where('artista', '==', oldName));
    const eventsSnapshot = await getDocs(eventsQuery);
    eventsSnapshot.forEach(eventDoc => {
      const eventRef = doc(db, 'events', eventDoc.id);
      batch.update(eventRef, { artista: newName });
    });
  }
  await batch.commit();
}

export async function deleteArtista(id: string): Promise<void> {
  const docRef = doc(db, 'artistas', id);
  await deleteDoc(docRef);
}

// --- Transaction Functions ---
export const getTransactions = cache(async (): Promise<Transaction[]> => {
  const q = query(transactionsCollection, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
});

export async function addTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
  const docRef = await addDoc(transactionsCollection, transactionData as Transaction);
  return { id: docRef.id, ...transactionData };
}

export async function updateTransaction(id: string, transactionData: Partial<Omit<Transaction, 'id'>>): Promise<void> {
  const docRef = doc(db, 'transactions', id);
  const cleanData = Object.fromEntries(Object.entries(transactionData).filter(([_, v]) => v !== undefined));
  if (cleanData.date) {
    cleanData.date = Timestamp.fromDate(new Date(cleanData.date));
  }
  await updateDoc(docRef, cleanData);
}

export async function deleteTransaction(id: string): Promise<void> {
  const docRef = doc(db, 'transactions', id);
  await deleteDoc(docRef);
}
