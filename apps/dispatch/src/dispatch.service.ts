import { Injectable } from '@nestjs/common';

@Injectable()
export class DispatchService {
  getHello(): string {
    return 'Hello World!';
  }
}
