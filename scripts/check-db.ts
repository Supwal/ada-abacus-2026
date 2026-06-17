import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 ESTADO ATUAL DO BANCO DE DADOS ADA APP\n');
  console.log('='.repeat(50));
  
  const users = await prisma.user.count();
  const locations = await prisma.location.count();
  const services = await prisma.service.count();
  const clients = await prisma.client.count();
  const appointments = await prisma.appointment.count();
  const expenses = await prisma.expense.count();
  const expenseCategories = await prisma.expenseCategory.count();
  
  console.log('\n👤 Usuários: ' + users);
  console.log('📍 Locais: ' + locations);
  console.log('💼 Serviços: ' + services);
  console.log('👥 Clientes: ' + clients);
  console.log('📅 Agendamentos: ' + appointments);
  console.log('💸 Despesas: ' + expenses);
  console.log('🏷️  Categorias de Despesas: ' + expenseCategories);
  
  console.log('\n' + '='.repeat(50));
  
  const cats = await prisma.expenseCategory.findMany();
  console.log('\n🏷️  Categorias de Despesas Criadas:');
  cats.forEach(c => console.log('   - ' + c.name));
  
  const testUser = await prisma.user.findFirst();
  if (testUser) {
    console.log('\n👤 Usuário de Teste:');
    console.log('   Email: ' + testUser.email);
    console.log('   Nome: ' + testUser.name);
    console.log('   Senha: 123456');
  }
  
  console.log('\n✅ Banco de dados configurado e pronto para uso!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
