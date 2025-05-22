import { Injectable } from '@nestjs/common';

@Injectable()
export class LoopService {
  runInLoop(callback: (...params: any) => any, iteration_count: number) {
    for (let i = 0; i < iteration_count; i++) {
      callback?.();
    }
  }
}
