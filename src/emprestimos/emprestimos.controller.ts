import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import CreateEmprestimosDto from "./dtos/create-emprestimos.dto";
import { EmprestimosService } from "./emprestimos.service";

@Controller("emprestimos")
export class EmprestimosController {
	constructor(private readonly emprestimosService: EmprestimosService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
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
}
