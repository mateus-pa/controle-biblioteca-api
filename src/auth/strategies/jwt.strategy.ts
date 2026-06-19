import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import "dotenv/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		const jwtSecret = process.env["JWT_SECRET"];

		if (!jwtSecret) {
			throw new Error(
				"CRITICAL: A variável de ambiente JWT_SECRET não foi definida!",
			);
		}

		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtSecret,
		});
	}

	async validate(payload: JwtPayload) {
		return { id: payload.sub, email: payload.email, role: payload.role };
	}
}
