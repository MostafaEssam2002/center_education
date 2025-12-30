import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
@Global() 
@Module({
    providers: [PrismaService],
    exports: [PrismaService], // مهم جدًا عشان نستخدمه في أي Module تاني
})
export class PrismaModule {}
