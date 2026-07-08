import { Injectable } from "@nestjs/common";
import { StatusEmprestimo } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { FiltroLivroStatus, ListarLivrosDto } from "./dtos/listar-livros.dto";

@Injectable()
export class LivrosService {
	constructor(private readonly prisma: PrismaService) {}

	async listar(query: ListarLivrosDto, userRole: string) {
		const { status, page = 1, limit = 10 } = query;

		const skip = (page - 1) * limit;
		const agora = new Date();

		const onde: any = {};

		let statusFiltrado = status;
		if (status === FiltroLivroStatus.ATRASADOS && userRole !== "ADMIN") {
			statusFiltrado = FiltroLivroStatus.TODOS;
		}

		if (statusFiltrado === FiltroLivroStatus.DISPONIVEIS) {
			onde.disponivel = true;
		} else if (statusFiltrado === FiltroLivroStatus.INDISPONIVEIS) {
			onde.disponivel = false;
		} else if (statusFiltrado === FiltroLivroStatus.ATRASADOS) {
			onde.emprestimos = {
				some: {
					status: StatusEmprestimo.ATIVO,
					dataLimite: {
						lt: agora,
					},
				},
			};
		}

		const [total, livros] = await this.prisma.$transaction([
			this.prisma.livro.count({ where: onde }),
			this.prisma.livro.findMany({
				where: onde,
				skip,
				take: limit,
				select: {
					id: true,
					titulo: true,
					autor: true,
					isbn: true,
					disponivel: true,
				},
				orderBy: {
					titulo: "asc",
				},
			}),
		]);

		return {
			dados: livros,
			meta: {
				total,
				paginaAtual: page,
				limitePorPagina: limit,
				totalPaginas: Math.ceil(total / limit),
			},
		};
	}
}
