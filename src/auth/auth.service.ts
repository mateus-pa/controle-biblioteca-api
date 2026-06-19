import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../database/prisma.service";
import { LoginDto } from "./dtos/login.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
	) {}

	async login(loginDto: LoginDto) {
		const { email, senha } = loginDto;

		const usuario = await this.prisma.usuario.findUnique({
			where: { email },
		});

		if (!usuario) {
			throw new UnauthorizedException("Credenciais inválidas.");
		}

		const senhaValida = await bcrypt.compare(senha, usuario.senha);

		if (!senhaValida) {
			throw new UnauthorizedException("Credenciais inválidas.");
		}

		const payload: JwtPayload = {
			sub: usuario.id,
			email: usuario.email,
			role: usuario.role,
		};

		return {
			access_token: this.jwtService.sign(payload),
		};
	}
}
