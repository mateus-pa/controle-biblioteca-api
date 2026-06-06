import * as bcrypt from "bcrypt";
import { Role } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
	// 1. Limpar dados antigos (opcional, para evitar conflitos de dados únicos como Email e ISBN)
	await prisma.emprestimo.deleteMany();
	await prisma.livro.deleteMany();
	await prisma.usuario.deleteMany();

	// 2. Gerar hash de senha padrão para os usuários de teste (ex: "senha123")
	const senhaHash = await bcrypt.hash("senha123", 10);

	// 3. Criar Usuários de Teste
	const admin = await prisma.usuario.create({
		data: {
			nome: "Carlos Admin",
			email: "admin@biblioteca.com",
			senha: senhaHash,
			role: Role.ADMIN,
		},
	});

	const leitor = await prisma.usuario.create({
		data: {
			nome: "Ana Leitora",
			email: "ana@leitor.com",
			senha: senhaHash,
			role: Role.LEITOR,
		},
	});

	// 4. Criar Livros de Teste
	await prisma.livro.createMany({
		data: [
			{
				titulo: "Código Limpo",
				autor: "Robert C. Martin",
				isbn: "9788576082675",
				disponivel: true,
			},
			{
				titulo: "Arquitetura Limpa",
				autor: "Robert C. Martin",
				isbn: "9788550804606",
				disponivel: true,
			},
			{
				titulo: "O Programador Pragmático",
				autor: "Andrew Hunt",
				isbn: "9788573076691",
				disponivel: true,
			},
		],
	});

	console.log("Seed executado com sucesso!");
	console.log(`Admin criado: ${admin.email}`);
	console.log(`Leitor criado: ${leitor.email}`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
