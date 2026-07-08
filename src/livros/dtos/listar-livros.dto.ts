import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Min } from "class-validator";

export enum FiltroLivroStatus {
	TODOS = "todos",
	DISPONIVEIS = "disponiveis",
	INDISPONIVEIS = "indisponiveis",
	ATRASADOS = "atrasados", // Apenas Admin poderá usar este
}

export class ListarLivrosDto {
	@IsOptional()
	@IsEnum(FiltroLivroStatus)
	status?: FiltroLivroStatus = FiltroLivroStatus.TODOS;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number = 10;
}
