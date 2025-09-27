import type { Event, Contratante, Artista, Transaction } from './types';
import { db } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// --- Helper Functions ---

/**
 * Converts Firestore Timestamps to Date objects in a document.
 * This is necessary because Firestore returns a Timestamp object,
 * but the application expects a standard JavaScript Date object.
 */
function convertTimestamps<T>(docData: any): T {
  if (!docData) return docData;
  const data = { ...docData };
  for (const key in data) {
    if (data[key] instanceof FieldValue) {
        // This can happen during updates, ignore it.
    } else if (data[key] && typeof data[key].toDate === 'function') {
      // This is a Firestore Timestamp
      data[key] = data[key].toDate();
    }
  }
  return data as T;
}


// --- Event Functions ---

export async function getEvents(): Promise<Event[]> {
  const snapshot = await db.collection('events').orderBy('date', 'asc').get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => convertTimestamps<Event>({ id: doc.id, ...doc.data() }));
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const doc = await db.collection('events').doc(id).get();
  if (!doc.exists) {
    return undefined;
  }
  return convertTimestamps<Event>({ id: doc.id, ...doc.data() });
}

export async function addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
  const docRef = await db.collection('events').add(eventData);
  return {
    id: docRef.id,
    ...eventData,
  };
}

export async function updateEvent(id: string, eventData: Partial<Omit<Event, 'id'>>): Promise<Event | undefined> {
    const docRef = db.collection('events').doc(id);
    await docRef.update(eventData);
    return await getEventById(id);
}

export async function deleteEvent(id: string): Promise<boolean> {
  await db.collection('events').doc(id).delete();
  return true;
}

// --- Contratante Functions ---

export async function getContratantes(): Promise<Contratante[]> {
  const snapshot = await db.collection('contratantes').orderBy('name', 'asc').get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contratante));
}

export async function getContratanteById(id: string): Promise<Contratante | undefined> {
    const doc = await db.collection('contratantes').doc(id).get();
    if (!doc.exists) {
        return undefined;
    }
    return { id: doc.id, ...doc.data() } as Contratante;
}

export async function addContratante(contratanteData: Omit<Contratante, 'id'>): Promise<Contratante> {
  const docRef = await db.collection('contratantes').add(contratanteData);
  return {
    id: docRef.id,
    ...contratanteData,
  };
}

export async function updateContratante(id: string, contratanteData: Partial<Omit<Contratante, 'id'>>): Promise<Contratante | undefined> {
    const docRef = db.collection('contratantes').doc(id);
    await docRef.update(contratanteData);
    return await getContratanteById(id);
}

export async function deleteContratante(id: string): Promise<boolean> {
    await db.collection('contratantes').doc(id).delete();
    return true;
}


// --- Artista Functions ---

export async function getArtistas(): Promise<Artista[]> {
  const snapshot = await db.collection('artistas').orderBy('name', 'asc').get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artista));
}

export async function getArtistaById(id: string): Promise<Artista | undefined> {
    const doc = await db.collection('artistas').doc(id).get();
    if (!doc.exists) {
        return undefined;
    }
    return { id: doc.id, ...doc.data() } as Artista;
}

export async function addArtista(artistaData: Omit<Artista, 'id'>): Promise<Artista> {
  const docRef = await db.collection('artistas').add(artistaData);
  return {
    id: docRef.id,
    ...artistaData,
  };
}

export async function updateArtista(id: string, artistaData: Partial<Omit<Artista, 'id'>>): Promise<Artista | undefined> {
    const docRef = db.collection('artistas').doc(id);
    await docRef.update(artistaData);
    return await getArtistaById(id);
}

export async function deleteArtista(id: string): Promise<boolean> {
    await db.collection('artistas').doc(id).delete();
    return true;
}


// --- Transaction Functions ---

export async function getTransactions(): Promise<Transaction[]> {
    const snapshot = await db.collection('transactions').orderBy('date', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => convertTimestamps<Transaction>({ id: doc.id, ...doc.data() }));
}

export async function addTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
    const docRef = await db.collection('transactions').add(transactionData);
    return {
        id: docRef.id,
        ...transactionData,
    };
}

export async function updateTransaction(id: string, transactionData: Partial<Omit<Transaction, 'id'>>): Promise<Transaction | undefined> {
    const docRef = db.collection('transactions').doc(id);
    await docRef.update(transactionData);
    const updatedDoc = await docRef.get();
    return convertTimestamps<Transaction>({ id: updatedDoc.id, ...updatedDoc.data() });
}

export async function deleteTransaction(id: string): Promise<boolean> {
    await db.collection('transactions').doc(id).delete();
    return true;
}
