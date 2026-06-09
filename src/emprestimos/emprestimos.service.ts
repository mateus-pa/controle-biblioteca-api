import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { StatusEmprestimo } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import CreateEmprestimosDto from "./dtos/create-emprestimos";

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
}
