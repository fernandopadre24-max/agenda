import type { Event, Contratante, Artista, Transaction } from './types';
import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src', 'db');

const ARTISTAS_PATH = path.join(dataDir, 'artistas.json');
const CONTRATANTES_PATH = path.join(dataDir, 'contratantes.json');
const EVENTS_PATH = path.join(dataDir, 'events.json');
const TRANSACTIONS_PATH = path.join(dataDir, 'transactions.json');

// Helper function to ensure directory and files exist
async function ensureDbFile(filePath: string) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify([]), 'utf-8');
  }
}

// Helper functions to get and set data from JSON files
async function getData<T>(filePath: string): Promise<T[]> {
    await ensureDbFile(filePath);
    try {
        const item = await fs.readFile(filePath, 'utf-8');
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error(`Error reading from file "${path.basename(filePath)}":`, error);
        return [];
    }
}

async function setData<T>(filePath: string, data: T[]): Promise<void> {
    await ensureDbFile(filePath);
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing to file "${path.basename(filePath)}":`, error);
    }
}


// Event functions
export async function getEvents(): Promise<Event[]> {
  const events = await getData<Event>(EVENTS_PATH);
  return events
    .map(e => ({...e, date: new Date(e.date)}))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const events = await getEvents();
  return events.find(event => event.id === id);
}

export async function addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
  const events = await getEvents();
  const newEvent: Event = {
    id: String(Date.now() + Math.random()),
    ...eventData,
  };
  events.push(newEvent);
  await setData(EVENTS_PATH, events);
  return newEvent;
}

export async function updateEvent(id: string, eventData: Partial<Omit<Event, 'id'>>): Promise<Event | undefined> {
    const events = await getEvents();
    const eventIndex = events.findIndex(event => event.id === id);
    if(eventIndex === -1) return undefined;

    const currentEvent = events[eventIndex];
    const updatedEvent = { 
        ...currentEvent, 
        ...eventData, 
    } as Event;

    events[eventIndex] = updatedEvent;
    await setData(EVENTS_PATH, events);
    return updatedEvent;
}


export async function deleteEvent(id: string): Promise<boolean> {
  let events = await getEvents();
  const initialLength = events.length;
  events = events.filter(event => event.id !== id);
  await setData(EVENTS_PATH, events);
  return events.length < initialLength;
}

// Contratante functions
export async function getContratantes(): Promise<Contratante[]> {
  const contratantes = await getData<Contratante>(CONTRATANTES_PATH);
  return contratantes.sort((a,b) => a.name.localeCompare(b.name));
}

export async function getContratanteById(id: string): Promise<Contratante | undefined> {
    const contratantes = await getContratantes();
    return contratantes.find(c => c.id === id);
}

export async function addContratante(contratanteData: Omit<Contratante, 'id'>): Promise<Contratante> {
  const contratantes = await getContratantes();
  const newContratante: Contratante = {
    id: String(Date.now() + Math.random()),
    ...contratanteData,
  };
  contratantes.push(newContratante);
  await setData(CONTRATANTES_PATH, contratantes);
  return newContratante;
}

export async function updateContratante(id: string, contratanteData: Partial<Omit<Contratante, 'id'>>): Promise<Contratante | undefined> {
    const contratantes = await getContratantes();
    const contratanteIndex = contratantes.findIndex(c => c.id === id);
    if (contratanteIndex === -1) return undefined;

    const updatedContratante = { ...contratantes[contratanteIndex], ...contratanteData };
    contratantes[contratanteIndex] = updatedContratante;
    await setData(CONTRATANTES_PATH, contratantes);
    return updatedContratante;
}

export async function deleteContratante(id: string): Promise<boolean> {
    let contratantes = await getContratantes();
    const initialLength = contratantes.length;
    contratantes = contratantes.filter(c => c.id !== id);
    await setData(CONTRATANTES_PATH, contratantes);
    return contratantes.length < initialLength;
}


// Artista functions
export async function getArtistas(): Promise<Artista[]> {
  const artistas = await getData<Artista>(ARTISTAS_PATH);
  return artistas.sort((a,b) => a.name.localeCompare(b.name));
}

export async function getArtistaById(id: string): Promise<Artista | undefined> {
    const artistas = await getArtistas();
    return artistas.find(a => a.id === id);
}

export async function addArtista(artistaData: Omit<Artista, 'id'>): Promise<Artista> {
  const artistas = await getArtistas();
  const newArtista: Artista = {
    id: String(Date.now() + Math.random()),
    ...artistaData,
  };
  artistas.push(newArtista);
  await setData(ARTISTAS_PATH, artistas);
  return newArtista;
}

export async function updateArtista(id: string, artistaData: Partial<Omit<Artista, 'id'>>): Promise<Artista | undefined> {
    const artistas = await getArtistas();
    const artistaIndex = artistas.findIndex(a => a.id === id);
    if (artistaIndex === -1) return undefined;
    
    const updatedArtista = { ...artistas[artistaIndex], ...artistaData };
    artistas[artistaIndex] = updatedArtista;
    await setData(ARTISTAS_PATH, artistas);
    return updatedArtista;
}

export async function deleteArtista(id: string): Promise<boolean> {
    let artistas = await getArtistas();
    const initialLength = artistas.length;
    artistas = artistas.filter(a => a.id !== id);
    await setData(ARTISTAS_PATH, artistas);
    return artistas.length < initialLength;
}

// Transaction functions
export async function getTransactions(): Promise<Transaction[]> {
    const transactions = await getData<Transaction>(TRANSACTIONS_PATH);
    return transactions
        .map(t => ({...t, date: new Date(t.date)}))
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
    const transactions = await getTransactions();
    const newTransaction: Transaction = {
        id: String(Date.now() + Math.random()),
        ...transactionData,
    };
    transactions.push(newTransaction);
    await setData(TRANSACTIONS_PATH, transactions);
    return newTransaction;
}

export async function updateTransaction(id: string, transactionData: Partial<Omit<Transaction, 'id'>>): Promise<Transaction | undefined> {
    const transactions = await getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    const updatedTransaction = { ...transactions[index], ...transactionData };
    transactions[index] = updatedTransaction;
    await setData(TRANSACTIONS_PATH, transactions);
    return updatedTransaction;
}

export async function deleteTransaction(id: string): Promise<boolean> {
    let transactions = await getTransactions();
    const initialLength = transactions.length;
    transactions = transactions.filter(t => t.id !== id);
    await setData(TRANSACTIONS_PATH, transactions);
    return transactions.length < initialLength;
}

    