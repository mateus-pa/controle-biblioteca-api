import { IsNotEmpty, IsUUID } from "class-validator";

export default class CreateEmprestimosDto {
	@IsUUID("4", { message: "O ID do livro deve ser um UUID válido." })
	@IsNotEmpty({
		message: "O ID do livro é obrigatório para realizar um empréstimo.",
	})
	livroId!: string;
}
