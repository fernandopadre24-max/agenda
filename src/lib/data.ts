'use server';

import type { Event, Contratante, Artista, Transaction } from './types';

// --- In-Memory Database ---
// NOTE: This data will reset on every server restart.
let memoryDB: {
  events: Event[],
  contratantes: Contratante[],
  artistas: Artista[],
  transactions: Transaction[],
} = {
  events: [],
  contratantes: [],
  artistas: [],
  transactions: [],
};

let nextId = 1;
const getNextId = () => (nextId++).toString();

// --- Event Functions ---
export async function getEvents(): Promise<Event[]> {
  // Ensure date objects are valid before sorting
  return [...memoryDB.events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getEventById(id: string): Promise<Event | undefined> {
  return memoryDB.events.find(e => e.id === id);
}

export async function addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
  const newId = getNextId();
  const date = new Date(eventData.date); // Ensure it's a Date object
  const newEvent: Event = { ...eventData, id: newId, date };
  memoryDB.events.push(newEvent);
  return newEvent;
}

export async function updateEvent(id: string, eventData: Partial<Omit<Event, 'id'>>): Promise<Event | undefined> {
    const eventIndex = memoryDB.events.findIndex(e => e.id === id);
    if (eventIndex === -1) return undefined;

    const existingEvent = memoryDB.events[eventIndex];
    
    const updatedEventData: Event = { ...existingEvent, ...eventData };

    if (eventData.date) {
        updatedEventData.date = new Date(eventData.date);
    }
    
    // Using hasOwnProperty to check for explicit undefined to allow unsetting pagar/receber
    if (Object.prototype.hasOwnProperty.call(eventData, 'pagar') && eventData.pagar === undefined) {
      delete (updatedEventData as Partial<Event>).pagar;
    }
    if (Object.prototype.hasOwnProperty.call(eventData, 'receber') && eventData.receber === undefined) {
      delete (updatedEventData as Partial<Event>).receber;
    }
    
    memoryDB.events[eventIndex] = updatedEventData;
    
    return updatedEventData;
}


export async function deleteEvent(id: string): Promise<boolean> {
  const initialLength = memoryDB.events.length;
  memoryDB.events = memoryDB.events.filter(e => e.id !== id);
  return memoryDB.events.length < initialLength;
}

// --- Contratante Functions ---
export async function getContratantes(): Promise<Contratante[]> {
  return [...memoryDB.contratantes].sort((a, b) => a.name.localeCompare(b.name));
}

export async function addContratante(contratanteData: Omit<Contratante, 'id'>): Promise<Contratante> {
  const newId = getNextId();
  const newContratante: Contratante = { ...contratanteData, id: newId };
  memoryDB.contratantes.push(newContratante);
  return newContratante;
}

export async function updateContratante(id: string, contratanteData: Partial<Omit<Contratante, 'id'>>): Promise<Contratante | undefined> {
    const index = memoryDB.contratantes.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    const oldName = memoryDB.contratantes[index].name;
    const newName = contratanteData.name;
    if (newName && oldName !== newName) {
        memoryDB.events.forEach(event => {
            if (event.contratante === oldName) {
                event.contratante = newName;
            }
        });
    }

    memoryDB.contratantes[index] = { ...memoryDB.contratantes[index], ...contratanteData };
    return memoryDB.contratantes[index];
}

export async function deleteContratante(id: string): Promise<boolean> {
    const initialLength = memoryDB.contratantes.length;
    memoryDB.contratantes = memoryDB.contratantes.filter(c => c.id !== id);
    return memoryDB.contratantes.length < initialLength;
}


// --- Artista Functions ---
export async function getArtistas(): Promise<Artista[]> {
  return [...memoryDB.artistas].sort((a,b) => a.name.localeCompare(b.name));
}

export async function addArtista(artistaData: Omit<Artista, 'id'>): Promise<Artista> {
  const newId = getNextId();
  const newArtista: Artista = { ...artistaData, id: newId };
  memoryDB.artistas.push(newArtista);
  return newArtista;
}

export async function updateArtista(id: string, artistaData: Partial<Omit<Artista, 'id'>>): Promise<Artista | undefined> {
    const index = memoryDB.artistas.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    
    const oldName = memoryDB.artistas[index].name;
    const newName = artistaData.name;
    if (newName && oldName !== newName) {
        memoryDB.events.forEach(event => {
            if (event.artista === oldName) {
                event.artista = newName;
            }
        });
    }
    
    memoryDB.artistas[index] = { ...memoryDB.artistas[index], ...artistaData };
    return memoryDB.artistas[index];
}

export async function deleteArtista(id: string): Promise<boolean> {
    const initialLength = memoryDB.artistas.length;
    memoryDB.artistas = memoryDB.artistas.filter(a => a.id !== id);
    return memoryDB.artistas.length < initialLength;
}


// --- Transaction Functions ---
export async function getTransactions(): Promise<Transaction[]> {
    return [...memoryDB.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newId = `trans-${getNextId()}`;
    const date = new Date(transactionData.date);
    const newTransaction: Transaction = { ...transactionData, id: newId, date };
    memoryDB.transactions.push(newTransaction);
    return newTransaction;
}

export async function updateTransaction(id: string, transactionData: Partial<Omit<Transaction, 'id'>>): Promise<Transaction | undefined> {
    const index = memoryDB.transactions.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    const update = { ...transactionData };
    if (update.date) {
        update.date = new Date(update.date);
    }
    
    memoryDB.transactions[index] = { ...memoryDB.transactions[index], ...update };
    return memoryDB.transactions[index];
}

export async function deleteTransaction(id: string): Promise<boolean> {
    const initialLength = memoryDB.transactions.length;
    memoryDB.transactions = memoryDB.transactions.filter(t => t.id !== id);
    return memoryDB.transactions.length < initialLength;
}
