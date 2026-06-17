import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário de teste
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'teste@ada.com' },
    update: {},
    create: {
      email: 'teste@ada.com',
      name: 'Usuário Teste',
      firstName: 'Usuário',
      lastName: 'Teste',
      hashedPassword,
    },
  });

  console.log('✅ Usuário criado:', user.email);

  // Criar localização padrão
  const location = await prisma.location.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Local Padrão',
      address: 'Endereço não especificado',
      description: 'Local padrão do sistema',
      userId: user.id,
    },
  });

  console.log('✅ Local padrão criado:', location.name);

  // Criar serviço padrão
  const service = await prisma.service.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Serviço Padrão',
      duration: 60,
      price: 100.0,
      description: 'Serviço padrão do sistema',
      userId: user.id,
    },
  });

  console.log('✅ Serviço padrão criado:', service.name);

  // Criar categorias de despesas padrão
  const categorias = [
    'Alimentação',
    'Transporte',
    'Materiais',
    'Aluguel',
    'Energia',
    'Água',
    'Internet',
    'Telefone',
    'Marketing',
    'Outros',
  ];

  for (const nome of categorias) {
    await prisma.expenseCategory.upsert({
      where: { name: nome },
      update: {},
      create: { name: nome },
    });
  }

  console.log('✅ Categorias de despesas criadas');

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
