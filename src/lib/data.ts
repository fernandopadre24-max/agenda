'use server';

import type { Event, Contratante, Artista, Transaction } from './types';
import { Timestamp } from 'firebase-admin/firestore';

// --- In-Memory Database ---
// NOTE: This data will reset on every server restart.
let memoryDB = {
  events: [
     { id: '1', date: new Date('2024-08-15T22:00:00.000Z'), hora: '22:00', contratante: 'Casamento Joana & Miguel', artista: 'Banda Sinfonia', entrada: '21:00', saida: '02:00', cidade: 'São Paulo', local: 'Buffet Felicidade', status: 'pendente', receber: { valor: 3500, status: 'pendente' } },
     { id: '2', date: new Date('2024-08-20T19:00:00.000Z'), hora: '19:00', contratante: 'Empresa XYZ', artista: 'DJ Anima', entrada: '18:30', saida: '23:00', cidade: 'Rio de Janeiro', local: 'Espaço Corporativo', status: 'pendente', receber: { valor: 2000, status: 'recebido' } },
     { id: '3', date: new Date('2024-09-01T15:00:00.000Z'), hora: '15:00', contratante: 'Aniversário de 50 anos', artista: 'Voz e Violão MPB', entrada: '14:00', saida: '18:00', cidade: 'Belo Horizonte', local: 'Chácara Paraíso', status: 'realizado', receber: { valor: 1200, status: 'recebido' } }
  ] as Event[],
  contratantes: [
    { id: '1', name: 'Casamento Joana & Miguel', category: 'Casamento' },
    { id: '2', name: 'Empresa XYZ', category: 'Corporativo' },
    { id: '3', name: 'Aniversário de 50 anos', category: 'Aniversário' }
  ] as Contratante[],
  artistas: [
    { id: '1', name: 'Banda Sinfonia', serviceType: 'Banda' },
    { id: '2', name: 'DJ Anima', serviceType: 'DJ' },
    { id: '3', name: 'Voz e Violão MPB', serviceType: 'Músico' }
  ] as Artista[],
  transactions: [] as Transaction[],
};
let nextId = 4;
const getNextId = () => (nextId++).toString();


// --- Event Functions ---
export async function getEvents(): Promise<Event[]> {
  try {
    const events = [...memoryDB.events];
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function getEventById(id: string): Promise<Event | undefined> {
  return memoryDB.events.find(e => e.id === id);
}

export async function addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
  const newId = getNextId();
  // Ensure date is a Date object
  const date = eventData.date instanceof Timestamp ? eventData.date.toDate() : new Date(eventData.date);
  const newEvent: Event = { ...eventData, id: newId, date };
  memoryDB.events.push(newEvent);
  return newEvent;
}

export async function updateEvent(id: string, eventData: Partial<Omit<Event, 'id'>>): Promise<Event | undefined> {
    const eventIndex = memoryDB.events.findIndex(e => e.id === id);
    if (eventIndex === -1) return undefined;
    
    const existingEvent = memoryDB.events[eventIndex];
    
    // Firestore's FieldValue.delete() is not applicable for in-memory, so we handle it manually.
    const updateData = { ...eventData };
    if ('receber' in updateData && updateData.receber === undefined) {
      delete existingEvent.receber;
    }
    if ('pagar' in updateData && updateData.pagar === undefined) {
      delete existingEvent.pagar;
    }
    
    const updatedEvent = { ...existingEvent, ...updateData };
    
    // Ensure date is a Date object
    if (updatedEvent.date) {
        updatedEvent.date = updatedEvent.date instanceof Timestamp ? updatedEvent.date.toDate() : new Date(updatedEvent.date);
    }
    
    memoryDB.events[eventIndex] = updatedEvent;
    
    return updatedEvent;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const initialLength = memoryDB.events.length;
  memoryDB.events = memoryDB.events.filter(e => e.id !== id);
  return memoryDB.events.length < initialLength;
}

// --- Contratante Functions ---
export async function getContratantes(): Promise<Contratante[]> {
  try {
    const contratantes = [...memoryDB.contratantes];
    return contratantes.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
     console.error("Error fetching contratantes:", error);
    return [];
  }
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
  try {
    const artistas = [...memoryDB.artistas];
    return artistas.sort((a,b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching artistas:", error);
    return [];
  }
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
    try {
        const transactions = [...memoryDB.transactions];
        return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch(e) {
        console.error("Error fetching transactions:", e);
        return [];
    }
}

export async function addTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newId = `trans-${getNextId()}`;
    const date = transactionData.date instanceof Timestamp ? transactionData.date.toDate() : new Date(transactionData.date);
    const newTransaction: Transaction = { ...transactionData, id: newId, date };
    memoryDB.transactions.push(newTransaction);
    return newTransaction;
}

export async function updateTransaction(id: string, transactionData: Partial<Omit<Transaction, 'id'>>): Promise<Transaction | undefined> {
    const index = memoryDB.transactions.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    const update = { ...transactionData };
    if (update.date) {
        update.date = update.date instanceof Timestamp ? update.date.toDate() : new Date(update.date);
    }
    
    memoryDB.transactions[index] = { ...memoryDB.transactions[index], ...update };
    return memoryDB.transactions[index];
}

export async function deleteTransaction(id: string): Promise<boolean> {
    const initialLength = memoryDB.transactions.length;
    memoryDB.transactions = memoryDB.transactions.filter(t => t.id !== id);
    return memoryDB.transactions.length < initialLength;
}
