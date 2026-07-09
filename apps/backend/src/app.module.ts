import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { JustOneModule } from './justone/justone.module';
import { AuthModule } from './auth/auth.module';
import { BiddingModule } from './bidding/bidding.module';
import { PriceModule } from './price/price.module';
import { DepartmentsModule } from './departments/departments.module';
import { MenusModule } from './menus/menus.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    JustOneModule,
    AuthModule,
    BiddingModule,
    PriceModule,
    DepartmentsModule,
    MenusModule,
  ],
})
export class AppModule {}
