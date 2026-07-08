import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ListarLivrosDto } from "./dtos/listar-livros.dto";
import { LivrosService } from "./livros.service";

@Controller("livros")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LivrosController {
	constructor(private readonly livrosService: LivrosService) {}

	@Get()
	@Roles("ADMIN", "LEITOR")
	async listar(
		@Query() query: ListarLivrosDto,
		@CurrentUser() user: { id: string; role: string },
	) {
		return this.livrosService.listar(query, user.role);
	}
}
