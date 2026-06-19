import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requeridasRoles = this.reflector.getAllAndOverride<string[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!requeridasRoles) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest();

		if (!user || !requeridasRoles.includes(user.role)) {
			throw new ForbiddenException(
				"Você não tem permissão para acessar este recurso.",
			);
		}

		return true;
	}
}
