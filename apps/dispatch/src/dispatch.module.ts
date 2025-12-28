import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { DatabaseModule } from 'libs/database/src/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DispatchController],
  providers: [DispatchService],
})
export class DispatchModule {}
