import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import CreateEmprestimosDto from "./dtos/create-emprestimos.dto";
import { EmprestimosService } from "./emprestimos.service";

@Controller("emprestimos")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmprestimosController {
	constructor(private readonly emprestimosService: EmprestimosService) {}

	@Post()
	@Roles("ADMIN", "LEITOR")
	async createEmprestimos(
		@Body() createEmprestimosDto: CreateEmprestimosDto,
		@CurrentUser() user: { id: string; role: string },
	) {
		return this.emprestimosService.createEmprestimos(
			user.id,
			createEmprestimosDto,
		);
	}

	@Get()
	@Roles("ADMIN", "LEITOR")
	async listarEmprestimos(@CurrentUser() user: { id: string; role: string }) {
		return this.emprestimosService.listarEmprestimos(user.id, user.role);
	}

	@Patch(":id/devolucao")
	@Roles("ADMIN")
	async devolverLivro(
		@Param("id") id: string,
		@CurrentUser() user: { id: string; role: string },
	) {
		return this.emprestimosService.devolverLivro(id);
	}
}
