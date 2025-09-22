'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { addEvent as dbAddEvent, deleteEvent as dbDeleteEvent, updateEvent as dbUpdateEvent } from './data';
import type { Event } from './types';

const eventSchema = z.object({
  contratante: z.string().min(1, 'O nome do contratante é obrigatório.'),
  artista: z.string().min(1, 'O nome do artista é obrigatório.'),
  date: z.coerce.date({ required_error: 'A data do evento é obrigatória.' }),
  hora: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido.'),
  entrada: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido.'),
  saida: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido.'),
  valorReceber: z.coerce.number().optional(),
  statusReceber: z.enum(['pendente', 'recebido']).optional(),
  valorPagar: z.coerce.number().optional(),
  statusPagar: z.enum(['pendente', 'pago']).optional(),
});

export type FormState = {
    message: string;
    errors?: {
        [key: string]: string[] | undefined;
    };
}

const createEventFromForm = (data: z.infer<typeof eventSchema>): Omit<Event, 'id'> => {
    const event: Omit<Event, 'id'> = {
        date: data.date,
        hora: data.hora,
        contratante: data.contratante,
        artista: data.artista,
        entrada: data.entrada,
        saida: data.saida,
    };
    if (data.valorReceber && data.statusReceber) {
        event.receber = { valor: data.valorReceber, status: data.statusReceber };
    }
    if (data.valorPagar && data.statusPagar) {
        event.pagar = { valor: data.valorPagar, status: data.statusPagar };
    }
    return event;
}

export async function createEventAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = eventSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Por favor, corrija os erros abaixo.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const newEvent = createEventFromForm(validatedFields.data);
    await dbAddEvent(newEvent);
  } catch (e) {
    return { message: 'Ocorreu um erro ao criar o evento.' };
  }
  
  revalidatePath('/');
  redirect('/');
}

export async function updateEventAction(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = eventSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Por favor, corrija os erros abaixo.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        const eventUpdate = createEventFromForm(validatedFields.data);
        await dbUpdateEvent(id, eventUpdate);
    } catch (e) {
        return { message: 'Ocorreu um erro ao atualizar o evento.' };
    }

    revalidatePath('/');
    revalidatePath(`/events/${id}`);
    redirect(`/events/${id}`);
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
