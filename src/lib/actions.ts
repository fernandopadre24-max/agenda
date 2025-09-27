'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
    addEvent as dbAddEvent, 
    deleteEvent as dbDeleteEvent, 
    updateEvent as dbUpdateEvent,
    addContratante as dbAddContratante,
    updateContratante as dbUpdateContratante,
    deleteContratante as dbDeleteContratante,
    getContratantes as dbGetContratantes,
    addArtista as dbAddArtista,
    updateArtista as dbUpdateArtista,
    deleteArtista as dbDeleteArtista,
    getArtistas as dbGetArtistas,
    getEvents,
    getEventById,
    addTransaction as dbAddTransaction,
    updateTransaction as dbUpdateTransaction,
    deleteTransaction as dbDeleteTransaction,
    getTransactions,
} from './data';
import type { Event, Artista, Contratante, ActionResponse, Transaction } from './types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const eventFormSchema = z.object({
  contratante: z.string().min(1, 'O nome do contratante é obrigatório.'),
  artista: z.string().min(1, 'O nome do artista é obrigatório.'),
  date: z.coerce.date({ required_error: 'A data do evento é obrigatória.' }),
  hora: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  entrada: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  saida: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  cidade: z.string().min(1, 'A cidade é obrigatória.'),
  local: z.string().min(1, 'O local é obrigatório.'),
  financeType: z.enum(['receber', 'pagar', 'nenhum']).default('nenhum'),
  valor: z.coerce.number().optional(),
  status: z.enum(['pendente', 'concluido']).optional(),
}).refine(data => {
    if (data.financeType !== 'nenhum') {
        return data.valor !== undefined && data.status !== undefined;
    }
    return true;
}, {
    message: 'Valor e status são obrigatórios para transações financeiras.',
    path: ['valor'],
});


const contratanteFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    responsibleName: z.string().optional(),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
    category: z.string().optional(),
});

const artistaFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
    serviceType: z.string().optional(),
});

const transactionFormSchema = z.object({
  description: z.string().min(3, 'A descrição é obrigatória.'),
  value: z.coerce.number().positive('O valor deve ser positivo.'),
  type: z.enum(['receber', 'pagar']),
  date: z.coerce.date(),
});


export type EventFormValues = z.infer<typeof eventFormSchema>;
export type ContratanteFormValues = z.infer<typeof contratanteFormSchema>;
export type ArtistaFormValues = z.infer<typeof artistaFormSchema>;
export type TransactionFormValues = z.infer<typeof transactionFormSchema>;


const createEventFromForm = (data: EventFormValues): Partial<Omit<Event, 'id'>> => {
    const event: any = {
        date: Timestamp.fromDate(data.date),
        hora: data.hora,
        contratante: data.contratante,
        artista: data.artista,
        entrada: data.entrada,
        saida: data.saida,
        cidade: data.cidade,
        local: data.local,
        status: 'pendente'
    };

    if (data.financeType === 'receber' && data.valor !== undefined && data.status) {
        event.receber = { valor: data.valor, status: data.status === 'concluido' ? 'recebido' : 'pendente' };
        event.pagar = FieldValue.delete(); // Ensure only one financial type exists
    } else if (data.financeType === 'pagar' && data.valor !== undefined && data.status) {
        event.pagar = { valor: data.valor, status: data.status === 'concluido' ? 'pago' : 'pendente' };
        event.receber = FieldValue.delete(); // Ensure only one financial type exists
    } else {
        event.pagar = FieldValue.delete();
        event.receber = FieldValue.delete();
    }

    return event;
}

export async function createEventAction(data: EventFormValues): Promise<ActionResponse> {
  const validatedFields = eventFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Por favor, corrija os erros abaixo.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const newEventData = createEventFromForm(validatedFields.data);
    const newEvent = await dbAddEvent(newEventData as Omit<Event, 'id'>);
    
    revalidatePath('/');
    revalidatePath('/agenda');
    revalidatePath('/financeiro');
    revalidatePath('/transacoes');

    return { success: true, message: 'Evento criado com sucesso!', data: newEvent };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
    return { success: false, message: `Ocorreu um erro ao criar o evento: ${errorMessage}` };
  }
}

export async function updateEventAction(id: string, data: EventFormValues): Promise<ActionResponse> {
    const validatedFields = eventFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Por favor, corrija os erros abaixo.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        const eventUpdateData = createEventFromForm(validatedFields.data);
        const updatedEvent = await dbUpdateEvent(id, eventUpdateData);
        
        revalidatePath('/');
        revalidatePath('/agenda');
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        revalidatePath(`/events/${id}`);
        
        return { success: true, message: 'Evento atualizado com sucesso!', data: updatedEvent };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro ao atualizar o evento: ${errorMessage}';
        return { success: false, message: `Ocorreu um erro ao atualizar o evento: ${errorMessage}` };
    }
}


export async function deleteEventAction(id: string): Promise<ActionResponse> {
    try {
        await dbDeleteEvent(id);
        revalidatePath('/');
        revalidatePath('/agenda');
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        return { success: true, message: 'Evento deletado com sucesso.', redirectPath: '/' };
    } catch (e) {
        return { success: false, message: 'Ocorreu um erro ao deletar o evento.' };
    }
}

export async function createContratanteAction(data: ContratanteFormValues): Promise<ActionResponse> {
    const validatedFields = contratanteFormSchema.safeParse(data);
    if(!validatedFields.success) {
        return {
            success: false,
            message: 'Por favor, corrija os erros abaixo.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    try {
        const newContratante = await dbAddContratante(validatedFields.data);
        revalidatePath('/contratantes');
        revalidatePath('/');
        revalidatePath('/agenda');
        return { success: true, message: 'Contratante criado com sucesso.', data: newContratante };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        return { success: false, message: `Ocorreu um erro ao criar o contratante: ${errorMessage}` };
    }
}

export async function updateContratanteAction(id: string, data: ContratanteFormValues): Promise<ActionResponse> {
    const validatedFields = contratanteFormSchema.safeParse(data);
    if(!validatedFields.success) {
        return {
            success: false,
            message: 'Por favor, corrija os erros abaixo.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    try {
        const updatedContratante = await dbUpdateContratante(id, validatedFields.data);
        revalidatePath('/contratantes');
        revalidatePath('/');
        revalidatePath('/agenda');
        return { success: true, message: 'Contratante atualizado com sucesso.', data: updatedContratante };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        return { success: false, message: `Ocorreu um erro ao atualizar o contratante: ${errorMessage}` };
    }
}

export async function deleteContratanteAction(id: string): Promise<ActionResponse> {
    try {
        const events = await getEvents();
        const contratantes = await dbGetContratantes();
        const contratante = contratantes.find(c => c.id === id);

        if (contratante) {
            const isAssociated = events.some(event => event.contratante === contratante.name);
            if (isAssociated) {
                return {
                    success: false,
                    message: 'Este contratante está associado a um ou mais eventos e não pode ser excluído.',
                };
            }
        }
        
        await dbDeleteContratante(id);
        revalidatePath('/contratantes');
        revalidatePath('/');
        revalidatePath('/agenda');
        return { success: true, message: 'Contratante deletado com sucesso.' };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        return { success: false, message: `Ocorreu um erro ao deletar o contratante: ${errorMessage}` };
    }
}

export async function createArtistaAction(data: ArtistaFormValues): Promise<ActionResponse> {
    const validatedFields = artistaFormSchema.safeParse(data);
    if(!validatedFields.success) {
        return {
            success: false,
            message: 'Por favor, corrija os erros abaixo.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    try {
        const newArtista = await dbAddArtista(validatedFields.data);
        revalidatePath('/artistas');
        revalidatePath('/');
        revalidatePath('/agenda');
        return { success: true, message: 'Artista criado com sucesso.', data: newArtista };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        return { success: false, message: `Ocorreu um erro ao criar o artista: ${errorMessage}` };
    }
}

export async function updateArtistaAction(id: string, data: ArtistaFormValues): Promise<ActionResponse> {
    const validatedFields = artistaFormSchema.safeParse(data);
    if(!validatedFields.success) {
        return {
            success: false,
            message: 'Por favor, corrija os erros abaixo.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    try {
        const updatedArtista = await dbUpdateArtista(id, validatedFields.data);
        revalidatePath('/artistas');
        revalidatePath('/');
        revalidatePath('/agenda');
        return { success: true, message: 'Artista atualizado com sucesso.', data: updatedArtista };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        return { success: false, message: `Ocorreu um erro ao atualizar o artista: ${errorMessage}` };
    }
}

export async function deleteArtistaAction(id: string): Promise<ActionResponse> {
    try {
        const events = await getEvents();
        const artistas = await dbGetArtistas();
        const artista = artistas.find(a => a.id === id);

        if (artista) {
            const isAssociated = events.some(event => event.artista === artista.name);
            if (isAssociated) {
                return {
                    success: false,
                    message: 'Este artista está associado a um ou mais eventos e não pode ser excluído.',
                };
            }
        }
        await dbDeleteArtista(id);
        revalidatePath('/artistas');
        revalidatePath('/');
        revalidatePath('/agenda');
        return { success: true, message: 'Artista deletado com sucesso.' };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        return { success: false, message: `Ocorreu um erro ao deletar o artista: ${errorMessage}` };
    }
}

export async function updateEventStatusAction(eventId: string, type: 'pagar' | 'receber'): Promise<ActionResponse> {
    try {
        const event = await getEventById(eventId);
        if (!event) {
            return { success: false, message: 'Evento não encontrado.' };
        }

        const updateData: Partial<Omit<Event, 'id'>> = {};
        if (type === 'pagar' && event.pagar) {
            updateData.pagar = { ...event.pagar, status: 'pago' };
        } else if (type === 'receber' && event.receber) {
            updateData.receber = { ...event.receber, status: 'recebido' };
        } else {
            return { success: false, message: 'Tipo de atualização inválida para este evento.' };
        }

        await dbUpdateEvent(eventId, updateData);

        revalidatePath('/');
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        revalidatePath(`/events/${eventId}`);
        revalidatePath('/agenda');
        
        return { success: true, message: 'Status do evento atualizado com sucesso!' };

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        return { success: false, message: `Ocorreu um erro ao atualizar o status: ${errorMessage}` };
    }
}

export async function updateEventCompletionStatusAction(eventId: string): Promise<ActionResponse> {
    try {
        const event = await getEventById(eventId);
        if (!event) {
            return { success: false, message: 'Evento não encontrado.' };
        }

        await dbUpdateEvent(eventId, { status: 'realizado' });

        revalidatePath('/');
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        revalidatePath(`/events/${eventId}`);
        revalidatePath('/agenda');
        
        return { success: true, message: 'Status do evento atualizado para "realizado"!' };

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        return { success: false, message: `Ocorreu um erro ao atualizar o status: ${errorMessage}` };
    }
}


// Transaction Actions
export async function createTransactionAction(data: TransactionFormValues): Promise<ActionResponse> {
    const validatedFields = transactionFormSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Dados inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const transactionWithTimestamp = {
            ...validatedFields.data,
            date: Timestamp.fromDate(validatedFields.data.date)
        };
        const newTransaction = await dbAddTransaction({ ...transactionWithTimestamp, status: 'concluido' });
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        return { success: true, message: 'Transação criada com sucesso.', data: newTransaction };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        return { success: false, message: `Falha ao criar transação: ${errorMessage}` };
    }
}

export async function updateTransactionAction(id: string, data: Partial<TransactionFormValues>): Promise<ActionResponse> {
    const validatedFields = transactionFormSchema.partial().safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Dados inválidos.' };
    }

    let dataWithTimestamp: any = { ...validatedFields.data };
    if (validatedFields.data.date) {
        dataWithTimestamp.date = Timestamp.fromDate(validatedFields.data.date);
    }
    
    try {
        const updatedTransaction = await dbUpdateTransaction(id, dataWithTimestamp);
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        return { success: true, message: 'Transação atualizada.', data: updatedTransaction };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        return { success: false, message: `Falha ao atualizar transação: ${errorMessage}` };
    }
}

export async function deleteTransactionAction(id: string): Promise<ActionResponse> {
    try {
        await dbDeleteTransaction(id);
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        return { success: true, message: 'Transação excluída.' };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        return { success: false, message: `Falha ao excluir transação: ${errorMessage}` };
    }
}
