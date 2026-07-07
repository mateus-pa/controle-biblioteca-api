import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { StatusEmprestimo } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import CreateEmprestimosDto from "./dtos/create-emprestimos.dto";

@Injectable()
export class EmprestimosService {
	constructor(private readonly prisma: PrismaService) {}

	async createEmprestimos(
		usuarioId: string,
		createEmprestimosDto: CreateEmprestimosDto,
	) {
		const { livroId } = createEmprestimosDto;

		const livro = await this.prisma.livro.findUnique({
			where: { id: livroId },
		});

		if (!livro) {
			throw new NotFoundException("O livro solicitado não foi encontrado.");
		}

		if (!livro.disponivel) {
			throw new BadRequestException(
				"O livro solicitado já está emprestado e não está disponível no momento.",
			);
		}

		const usuario = await this.prisma.usuario.findUnique({
			where: { id: usuarioId },
		});

		if (!usuario) {
			throw new NotFoundException("O usuário informado não foi encontrado.");
		}

		const dataEmprestimo = new Date();
		const dataLimite = new Date();
		dataLimite.setDate(dataEmprestimo.getDate() + 14);

		return this.prisma.$transaction(async (tx) => {
			await tx.livro.update({
				where: { id: livroId },
				data: { disponivel: false },
			});

			return tx.emprestimo.create({
				data: {
					usuarioId,
					livroId,
					dataEmprestimo,
					dataLimite,
					status: StatusEmprestimo.ATIVO,
				},
				include: {
					livro: true,
					usuario: {
						select: {
							id: true,
							nome: true,
							email: true,
						},
					},
				},
			});
		});
	}

	async listarEmprestimos(usuarioId: string, role: string) {
		const filtroUsuario: any = {};

		if (role !== "ADMIN") {
			filtroUsuario.usuarioId = usuarioId;
		}

		return this.prisma.emprestimo.findMany({
			where: filtroUsuario,
			select: {
				id: true,
				dataEmprestimo: true,
				dataLimite: true,
				status: true,
				livro: {
					select: {
						id: true,
						titulo: true,
					},
				},
				usuario: {
					select: {
						id: true,
						nome: true,
					},
				},
			},
			orderBy: {
				dataEmprestimo: "desc",
			},
		});
	}

	async listarAtrasados() {
		const agora = new Date();

		return this.prisma.emprestimo.findMany({
			where: {
				dataLimite: {
					lt: agora,
				},
				dataDevolucao: null,
			},
			select: {
				id: true,
				dataEmprestimo: true,
				dataLimite: true,
				status: true,
				livro: {
					select: {
						id: true,
						titulo: true,
					},
				},
				usuario: {
					select: {
						id: true,
						nome: true,
					},
				},
			},
			orderBy: {
				dataLimite: "asc",
			},
		});
	}

	async devolverLivro(id: string) {
		const emprestimo = await this.prisma.emprestimo.findUnique({
			where: { id },
		});

		if (!emprestimo) {
			throw new NotFoundException("Empréstimo não encontrado.");
		}

		if (
			emprestimo.status === StatusEmprestimo.DEVOLVIDO ||
			emprestimo.status === StatusEmprestimo.ATRASADO
		) {
			throw new BadRequestException("Este empréstimo já foi encerrado.");
		}

		const dataDevolucao = new Date();

		let statusFinal: StatusEmprestimo = StatusEmprestimo.DEVOLVIDO;

		if (dataDevolucao > emprestimo.dataLimite) {
			statusFinal = StatusEmprestimo.ATRASADO;
		}

		return this.prisma.$transaction(async (tx) => {
			await tx.livro.update({
				where: { id: emprestimo.livroId },
				data: { disponivel: true },
			});

			return tx.emprestimo.update({
				where: { id },
				data: {
					status: statusFinal,
					dataDevolucao,
				},
				select: {
					id: true,
					status: true,
					dataDevolucao: true,
				},
			});
		});
	}
}
