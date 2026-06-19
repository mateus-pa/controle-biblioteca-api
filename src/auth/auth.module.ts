import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import "dotenv/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: "jwt" }),
		JwtModule.registerAsync({
			useFactory: async () => {
				const jwtSecret = process.env["JWT_SECRET"];

				if (!jwtSecret) {
					throw new Error(
						"CRITICAL: A variável de ambiente JWT_SECRET não foi definida!",
					);
				}

				return {
					secret: jwtSecret,
					signOptions: { expiresIn: "1d" },
				};
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	exports: [PassportModule, JwtModule],
})
export class AuthModule {}
