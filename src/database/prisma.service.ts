import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient } from "../../generated/prisma/client";

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private pool: Pool;

	constructor() {
		const connectionString = `${process.env.DATABASE_URL}`;

		const pool = new Pool({ connectionString });
		const adapter = new PrismaPg(pool);

		super({ adapter });
		this.pool = pool;
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
		await this.pool.end();
	}
}
