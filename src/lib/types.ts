export type Contratante = {
  id: string;
  name: string;
  responsibleName?: string;
  email?: string;
  phone?: string;
  category?: string;
};

export type Artista = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  serviceType?: string;
};


export type Event = {
  id: string;
  date: Date;
  hora: string;
  contratante: string;
  artista: string;
  entrada: string;
  saida: string;
  cidade: string;
  local: string;
  status: 'pendente' | 'realizado';
  pagar?: {
    valor: number;
    status: 'pendente' | 'pago';
  };
  receber?: {
    valor: number;
    status: 'pendente' | 'recebido';
  };
};

export type Transaction = {
    id: string;
    description: string;
    value: number;
    type: 'pagar' | 'receber';
    status: 'pendente' | 'concluido';
    date: Date;
}

export type ActionResponse = {
    success: boolean;
    message: string;
    redirectPath?: string;
    data?: Artista | Contratante | Transaction;
    errors?: { [key: string]: string[] | undefined; };
}
