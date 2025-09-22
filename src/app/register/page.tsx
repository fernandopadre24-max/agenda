import { RegisterForm } from '@/components/RegisterForm';
import { PageHeader } from '@/components/PageHeader';

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Criar Conta" />
      <main className="flex-1 p-4 md:p-6">
        <RegisterForm />
      </main>
    </div>
  );
}
