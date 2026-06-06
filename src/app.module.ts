import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmprestimosModule } from './emprestimos/emprestimos.module';

@Module({
  imports: [EmprestimosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
