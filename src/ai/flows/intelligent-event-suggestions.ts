'use server';

/**
 * @fileOverview An AI agent that provides intelligent event suggestions based on user input.
 *
 * - getEventSuggestions - A function that takes a partial event description and returns suggested completions.
 * - EventSuggestionInput - The input type for the getEventSuggestions function.
 * - EventSuggestionOutput - The return type for the getEventSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EventSuggestionInputSchema = z.object({
  partialEvent: z
    .string()
    .describe('A partial description of the event for which to provide suggestions.'),
  pastEvents: z
    .string()
    .array()
    .describe('An array of descriptions of past events created by the user.'),
});
export type EventSuggestionInput = z.infer<typeof EventSuggestionInputSchema>;

const EventSuggestionOutputSchema = z.object({
  suggestions: z
    .string()
    .array()
    .describe('An array of suggested event details based on the input and past events. Example: "artista: Nome do Artista, contratante: Nome do Contratante, data: DD/MM/YYYY, hora: HH:MM, valor: 1500"'),
});
export type EventSuggestionOutput = z.infer<typeof EventSuggestionOutputSchema>;

export async function getEventSuggestions(input: EventSuggestionInput): Promise<EventSuggestionOutput> {
  return eventSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'eventSuggestionPrompt',
  input: {schema: EventSuggestionInputSchema},
  output: {schema: EventSuggestionOutputSchema},
  prompt: `Você é um assistente inteligente para agendamento de eventos. Com base em uma descrição parcial do evento e em um histórico de eventos anteriores, sua tarefa é extrair e estruturar as informações para preencher um formulário.

Analise a "Descrição Parcial do Evento" e, se possível, extraia as seguintes informações:
- nome do contratante
- nome do artista
- data do evento (formato DD/MM/YYYY)
- hora do evento (formato HH:MM)
- valor/cachê (apenas números)

Use o histórico de "Eventos Passados" como contexto para inferir informações que possam estar faltando ou para corrigir ambiguidades.

Retorne as informações extraídas em uma única string no formato "chave: valor", separadas por vírgulas. Por exemplo: "contratante: Casamento Joana & Miguel, artista: Banda Sinfonia, data: 15/12/2024, hora: 22:00, valor: 3500".

Se uma informação não puder ser extraída, não a inclua na string de sugestão.

Descrição Parcial do Evento: {{{partialEvent}}}

Eventos Passados:
{{#each pastEvents}}
- {{{this}}}
{{/each}}

`,
});

const eventSuggestionFlow = ai.defineFlow(
  {
    name: 'eventSuggestionFlow',
    inputSchema: EventSuggestionInputSchema,
    outputSchema: EventSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
