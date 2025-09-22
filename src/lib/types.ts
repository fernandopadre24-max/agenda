export type Event = {
  id: string;
  date: Date;
  hora: string;
  contratante: string;
  artista: string;
  entrada: string;
  saida: string;
  pagar?: {
    valor: number;
    status: 'pendente' | 'pago';
  };
  receber?: {
    valor: number;
    status: 'pendente' | 'recebido';
  };
};
