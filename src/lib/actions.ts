'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addEvent as dbAddEvent, deleteEvent as dbDeleteEvent, updateEvent as dbUpdateEvent, getEvents } from './data';
import type { Event } from './types';
import { redirect } from 'next/navigation';

const eventFormSchema = z.object({
  contratante: z.string().min(1, 'O nome do contratante é obrigatório.'),
  artista: z.string().min(1, 'O nome do artista é obrigatório.'),
  date: z.coerce.date({ required_error: 'A data do evento é obrigatória.' }),
  hora: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  entrada: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  saida: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
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

export type EventFormValues = z.infer<typeof eventFormSchema>;

export type ActionResponse = {
    success: boolean;
    message: string;
    redirectPath?: string;
    errors?: { [key: string]: string[] | undefined; };
}

const createEventFromForm = (data: EventFormValues): Omit<Event, 'id'> => {
    const event: Omit<Event, 'id'> = {
        date: data.date,
        hora: data.hora,
        contratante: data.contratante,
        artista: data.artista,
        entrada: data.entrada,
        saida: data.saida,
    };

    if (data.financeType === 'receber' && data.valor !== undefined && data.status) {
        event.receber = { valor: data.valor, status: data.status === 'concluido' ? 'recebido' : 'pendente' };
    }
    if (data.financeType === 'pagar' && data.valor !== undefined && data.status) {
        event.pagar = { valor: data.valor, status: data.status === 'concluido' ? 'pago' : 'pendente' };
    }
    return event;
}

export async function createEventAction(rawData: EventFormValues): Promise<ActionResponse> {
  const validatedFields = eventFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Por favor, corrija os erros abaixo.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const newEvent = createEventFromForm(validatedFields.data);
    await dbAddEvent(newEvent);
  } catch (e) {
    return { success: false, message: 'Ocorreu um erro ao criar o evento.' };
  }
  
  revalidatePath('/');
  return { success: true, message: 'Evento criado!', redirectPath: '/' };
}

export async function updateEventAction(id: string, rawData: EventFormValues): Promise<ActionResponse> {
    const validatedFields = eventFormSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Por favor, corrija os erros abaixo.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        const eventUpdate = createEventFromForm(validatedFields.data);
        await dbUpdateEvent(id, eventUpdate);
    } catch (e) {
        return { success: false, message: 'Ocorreu um erro ao atualizar o evento.' };
    }

    revalidatePath('/');
    revalidatePath(`/events/${id}`);
    return { success: true, message: 'Evento atualizado!', redirectPath: `/events/${id}` };
}


export async function deleteEventAction(id: string) {
    try {
        await dbDeleteEvent(id);
        revalidatePath('/');
        redirect('/');
    } catch (e) {
        return { message: 'Ocorreu um erro ao deletar o evento.' };
    }
}
