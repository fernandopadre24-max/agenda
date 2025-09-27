import type { Event, Contratante, Artista, Transaction } from './types';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src', 'db');

const ARTISTAS_PATH = path.join(dataDir, 'artistas.json');
const CONTRATANTES_PATH = path.join(dataDir, 'contratantes.json');
const EVENTS_PATH = path.join(dataDir, 'events.json');
const TRANSACTIONS_PATH = path.join(dataDir, 'transactions.json');

// Helper function to ensure directory and files exist
function ensureDbExists() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  [ARTISTAS_PATH, CONTRATANTES_PATH, EVENTS_PATH, TRANSACTIONS_PATH].forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]), 'utf-8');
    }
  });
}

// Helper functions to get and set data from JSON files
function getData<T>(filePath: string): T[] {
    ensureDbExists();
    try {
        const item = fs.readFileSync(filePath, 'utf-8');
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error(`Error reading from file "${path.basename(filePath)}":`, error);
        return [];
    }
}

function setData<T>(filePath: string, data: T[]): void {
    ensureDbExists();
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing to file "${path.basename(filePath)}":`, error);
    }
}


// Event functions
export async function getEvents(): Promise<Event[]> {
  const events = getData<Event>(EVENTS_PATH).map(e => ({...e, date: new Date(e.date)}));
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const events = await getEvents();
  return events.find(event => event.id === id);
}

export async function addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
  const events = await getEvents();
  const newEvent: Event = {
    id: String(Date.now()),
    ...eventData,
  };
  events.push(newEvent);
  setData(EVENTS_PATH, events);
  return newEvent;
}

export async function updateEvent(id: string, eventData: Partial<Omit<Event, 'id'>>): Promise<Event | undefined> {
    const events = await getEvents();
    const eventIndex = events.findIndex(event => event.id === id);
    if(eventIndex === -1) return undefined;

    // Garante que o status não seja sobrescrito se não for fornecido
    const currentEvent = events[eventIndex];
    const updatedEvent = { 
        ...currentEvent, 
        ...eventData, 
        id,
        // Mantém o status original se eventData não tiver um novo status
        status: 'status' in eventData ? eventData.status : currentEvent.status
    } as Event;

    events[eventIndex] = updatedEvent;
    setData(EVENTS_PATH, events);
    return updatedEvent;
}


export async function deleteEvent(id: string): Promise<boolean> {
  let events = await getEvents();
  const initialLength = events.length;
  events = events.filter(event => event.id !== id);
  setData(EVENTS_PATH, events);
  return events.length < initialLength;
}

// Contratante functions
export async function getContratantes(): Promise<Contratante[]> {
  return getData<Contratante>(CONTRATANTES_PATH).sort((a,b) => a.name.localeCompare(b.name));
}

export async function getContratanteById(id: string): Promise<Contratante | undefined> {
    const contratantes = await getContratantes();
    return contratantes.find(c => c.id === id);
}

export async function addContratante(contratanteData: Omit<Contratante, 'id' | 'responsibleName'> & { responsibleName?: string }): Promise<Contratante> {
  const contratantes = await getContratantes();
  const newContratante: Contratante = {
    id: String(Date.now() + Math.random()),
    ...contratanteData,
  };
  contratantes.push(newContratante);
  setData(CONTRATANTES_PATH, contratantes);
  return newContratante;
}

export async function updateContratante(id: string, contratanteData: Partial<Omit<Contratante, 'id'>>): Promise<Contratante | undefined> {
    const contratantes = await getContratantes();
    const contratanteIndex = contratantes.findIndex(c => c.id === id);
    if (contratanteIndex === -1) return undefined;

    const updatedContratante = { ...contratantes[contratanteIndex], ...contratanteData, id };
    contratantes[contratanteIndex] = updatedContratante;
    setData(CONTRATANTES_PATH, contratantes);
    return updatedContratante;
}

export async function deleteContratante(id: string): Promise<boolean> {
    let contratantes = await getContratantes();
    const initialLength = contratantes.length;
    contratantes = contratantes.filter(c => c.id !== id);
    setData(CONTRATANTES_PATH, contratantes);
    return contratantes.length < initialLength;
}


// Artista functions
export async function getArtistas(): Promise<Artista[]> {
  return getData<Artista>(ARTISTAS_PATH).sort((a,b) => a.name.localeCompare(b.name));
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
  setData(ARTISTAS_PATH, artistas);
  return newArtista;
}

export async function updateArtista(id: string, artistaData: Partial<Omit<Artista, 'id'>>): Promise<Artista | undefined> {
    const artistas = await getArtistas();
    const artistaIndex = artistas.findIndex(a => a.id === id);
    if (artistaIndex === -1) return undefined;
    
    const updatedArtista = { ...artistas[artistaIndex], ...artistaData, id };
    artistas[artistaIndex] = updatedArtista;
    setData(ARTISTAS_PATH, artistas);
    return updatedArtista;
}

export async function deleteArtista(id: string): Promise<boolean> {
    let artistas = await getArtistas();
    const initialLength = artistas.length;
    artistas = artistas.filter(a => a.id !== id);
    setData(ARTISTAS_PATH, artistas);
    return artistas.length < initialLength;
}

// Transaction functions
export async function getTransactions(): Promise<Transaction[]> {
    const transactions = getData<Transaction>(TRANSACTIONS_PATH).map(t => ({...t, date: new Date(t.date)}));
    return transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
    const transactions = await getTransactions();
    const newTransaction: Transaction = {
        id: String(Date.now() + Math.random()),
        ...transactionData,
    };
    transactions.push(newTransaction);
    setData(TRANSACTIONS_PATH, transactions);
    return newTransaction;
}

export async function updateTransaction(id: string, transactionData: Partial<Omit<Transaction, 'id'>>): Promise<Transaction | undefined> {
    const transactions = await getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    const updatedTransaction = { ...transactions[index], ...transactionData, id };
    transactions[index] = updatedTransaction;
    setData(TRANSACTIONS_PATH, transactions);
    return updatedTransaction;
}

export async function deleteTransaction(id: string): Promise<boolean> {
    let transactions = await getTransactions();
    const initialLength = transactions.length;
    transactions = transactions.filter(t => t.id !== id);
    setData(TRANSACTIONS_PATH, transactions);
    return transactions.length < initialLength;
}
