'use server';

import type { Event, Contratante, Artista, Transaction } from './types';
import fs from 'fs/promises';
import path from 'path';

// --- JSON File Database ---
const dbPath = path.resolve(process.cwd(), 'src', 'lib', 'db.json');

type DB = {
  events: Event[],
  contratantes: Contratante[],
  artistas: Artista[],
  transactions: Transaction[],
  nextId: number,
};

async function readDB(): Promise<DB> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(data);
    // Dates are stored as strings in JSON, so we need to convert them back to Date objects
    db.events.forEach((event: Event) => event.date = new Date(event.date));
    db.transactions.forEach((tx: Transaction) => tx.date = new Date(tx.date));
    return db;
  } catch (error) {
    // If the file doesn't exist, create it with a default structure
    const defaultDB: DB = {
      events: [],
      contratantes: [],
      artistas: [],
      transactions: [],
      nextId: 1,
    };
    await writeDB(defaultDB);
    return defaultDB;
  }
}

async function writeDB(db: DB): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}

const getNextId = (db: DB) => (db.nextId++).toString();


// --- Event Functions ---
export async function getEvents(): Promise<Event[]> {
  const db = await readDB();
  return [...db.events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const db = await readDB();
  return db.events.find(e => e.id === id);
}

export async function addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
  const db = await readDB();
  const newId = getNextId(db);
  const newEvent: Event = { ...eventData, id: newId, date: new Date(eventData.date) };
  db.events.push(newEvent);
  await writeDB(db);
  return newEvent;
}

export async function updateEvent(id: string, eventData: Partial<Omit<Event, 'id'>>): Promise<Event | undefined> {
    const db = await readDB();
    const eventIndex = db.events.findIndex(e => e.id === id);
    if (eventIndex === -1) return undefined;

    const existingEvent = db.events[eventIndex];
    
    const updatedEventData: Event = { ...existingEvent, ...eventData };

    if (eventData.date) {
        updatedEventData.date = new Date(eventData.date);
    }
    
    if (Object.prototype.hasOwnProperty.call(eventData, 'pagar') && eventData.pagar === undefined) {
      delete (updatedEventData as Partial<Event>).pagar;
    }
    if (Object.prototype.hasOwnProperty.call(eventData, 'receber') && eventData.receber === undefined) {
      delete (updatedEventData as Partial<Event>).receber;
    }
    
    db.events[eventIndex] = updatedEventData;
    await writeDB(db);
    return updatedEventData;
}


export async function deleteEvent(id: string): Promise<boolean> {
  const db = await readDB();
  const initialLength = db.events.length;
  db.events = db.events.filter(e => e.id !== id);
  const success = db.events.length < initialLength;
  if(success) await writeDB(db);
  return success;
}

// --- Contratante Functions ---
export async function getContratantes(): Promise<Contratante[]> {
  const db = await readDB();
  return [...db.contratantes].sort((a, b) => a.name.localeCompare(b.name));
}

export async function addContratante(contratanteData: Omit<Contratante, 'id'>): Promise<Contratante> {
  const db = await readDB();
  const newId = getNextId(db);
  const newContratante: Contratante = { ...contratanteData, id: newId };
  db.contratantes.push(newContratante);
  await writeDB(db);
  return newContratante;
}

export async function updateContratante(id: string, contratanteData: Partial<Omit<Contratante, 'id'>>): Promise<Contratante | undefined> {
    const db = await readDB();
    const index = db.contratantes.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    const oldName = db.contratantes[index].name;
    const newName = contratanteData.name;
    
    if (newName && oldName !== newName) {
        db.events.forEach(event => {
            if (event.contratante === oldName) {
                event.contratante = newName;
            }
        });
    }

    db.contratantes[index] = { ...db.contratantes[index], ...contratanteData };
    await writeDB(db);
    return db.contratantes[index];
}

export async function deleteContratante(id: string): Promise<boolean> {
    const db = await readDB();
    const initialLength = db.contratantes.length;
    db.contratantes = db.contratantes.filter(c => c.id !== id);
    const success = db.contratantes.length < initialLength;
    if(success) await writeDB(db);
    return success;
}


// --- Artista Functions ---
export async function getArtistas(): Promise<Artista[]> {
  const db = await readDB();
  return [...db.artistas].sort((a,b) => a.name.localeCompare(b.name));
}

export async function addArtista(artistaData: Omit<Artista, 'id'>): Promise<Artista> {
  const db = await readDB();
  const newId = getNextId(db);
  const newArtista: Artista = { ...artistaData, id: newId };
  db.artistas.push(newArtista);
  await writeDB(db);
  return newArtista;
}

export async function updateArtista(id: string, artistaData: Partial<Omit<Artista, 'id'>>): Promise<Artista | undefined> {
    const db = await readDB();
    const index = db.artistas.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    
    const oldName = db.artistas[index].name;
    const newName = artistaData.name;

    if (newName && oldName !== newName) {
        db.events.forEach(event => {
            if (event.artista === oldName) {
                event.artista = newName;
            }
        });
    }
    
    db.artistas[index] = { ...db.artistas[index], ...artistaData };
    await writeDB(db);
    return db.artistas[index];
}

export async function deleteArtista(id: string): Promise<boolean> {
    const db = await readDB();
    const initialLength = db.artistas.length;
    db.artistas = db.artistas.filter(a => a.id !== id);
    const success = db.artistas.length < initialLength;
    if(success) await writeDB(db);
    return success;
}


// --- Transaction Functions ---
export async function getTransactions(): Promise<Transaction[]> {
    const db = await readDB();
    return [...db.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
    const db = await readDB();
    const newId = `trans-${getNextId(db)}`;
    const newTransaction: Transaction = { ...transactionData, id: newId, date: new Date(transactionData.date) };
    db.transactions.push(newTransaction);
    await writeDB(db);
    return newTransaction;
}

export async function updateTransaction(id: string, transactionData: Partial<Omit<Transaction, 'id'>>): Promise<Transaction | undefined> {
    const db = await readDB();
    const index = db.transactions.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    const update = { ...transactionData };
    if (update.date) {
        update.date = new Date(update.date);
    }
    
    db.transactions[index] = { ...db.transactions[index], ...update };
    await writeDB(db);
    return db.transactions[index];
}

export async function deleteTransaction(id: string): Promise<boolean> {
    const db = await readDB();
    const initialLength = db.transactions.length;
    db.transactions = db.transactions.filter(t => t.id !== id);
    const success = db.transactions.length < initialLength;
    if(success) await writeDB(db);
    return success;
}
