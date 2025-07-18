import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  WsResponse,
  ConnectedSocket,
} from '@nestjs/websockets';
import { SessionService } from './session.service';
import { Server, Socket } from 'socket.io';
import { DBservice } from 'src/db/db.service';
import {
  TransactionLineType,
  TransactionSessionType,
  WalletAddressedRequest,
} from 'src/types/common';
import { Request, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { SignatureGuard } from 'src/guards/signature.guard';
import { SIGNMESSAGES } from 'src/contants';
import { SessionStartDTO, SessionStopDTO } from './dto/session.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import moralisHttp from 'src/modules/moralis';

@WebSocketGateway(3004, {
  cors: {
    origin: '*',
  },
})
export class SessionGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly sessionService: SessionService,
    private db: DBservice,
    private transaction: TransactionService,
  ) { }

  private activeControllers: Record<string, AbortController> = {};

  @UseGuards(new SignatureGuard(SIGNMESSAGES.CONNECT_SOCKET))
  handleConnection(client: any, ...args: any[]) { }

  emitToUser(socketId: string, event: string, payload: any) {
    this.server.to(socketId).emit(event, payload);
  }

  @SubscribeMessage("session-stop")
  async handleSessionStop(@ConnectedSocket() client: Socket, @MessageBody() data: SessionStopDTO): Promise<void> {
    const controller = this.activeControllers[data.wallet_address];
    if (controller) {
      controller.abort();
      delete this.activeControllers[data.wallet_address];
    }

    // Optionally, you can also emit a message to the client
    client.emit('session-end', { isLoop: data.isloop });


  }

  @SubscribeMessage('session-start')
  async handeSessionStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SessionStartDTO,
  ): Promise<User | null> {

    try {

      const controller = new AbortController();
      console.log(client, "client");
      this.activeControllers[data.wallet_address] = controller;
      const user = await this.db.getUserForWalletAddress(data.wallet_address);

      const session = await this.db.session.create({
        data: {
          is_flat: data.sessionData.interval === 'FLAT',
          is_loop: data.sessionData.type === 'LOOP',
          is_running: false,
          percentage: data.sessionData.percentage ?? 10,
          time_min: data.sessionData.min_time ?? 0,
          time_max: data.sessionData.max_time ?? 0,
          type: data.sessionData.transaction ?? 'BUY',
        },
      });


      if (!user) {
        throw new Error('');
      }


      const wallet_states = {}

      data.wallets.forEach(wallet => {
        wallet_states["W" + wallet.index] = {
          should_process: true,
          index: wallet.index,
          address: wallet.address,
        }
      })




      await this.transaction.startTransactionSession(
        controller,
        data.sessionData,
        user,
        data.wallets,
        wallet_states,
        0,
        async (isLoop, loopIndex) => {
          client.emit('session-start', {
            isLoop: isLoop,
            loopIndex: loopIndex,
          });
        },
        async (isLoop) => {
          client.emit('session-end', {
            isLoop: isLoop,
          });
        },
        async (line) => {
          // await this.db.sessionHistoryRecord.create({
          //   data: {
          //     is_fail: line.status === 'error',
          //     is_flat: data.sessionData.interval === 'FLAT',
          //     is_loop: data.sessionData.type === 'LOOP',
          //     is_success: line.status === 'success',
          //     is_working: line.status === 'loading',
          //     ticker: user?.target_token_ticker ?? '',
          //     token_count: line.token_amount,
          //     usd_value: line.usd_value,
          //     type: line.type,
          //     wallet_index: line.index,
          //     Session: {
          //       connect: { id: session.id },
          //     },
          //   },
          // });


          client.emit('session-line', { ...line, token_amount: String(line.token_amount) });
        },
      );
      return user;
    }
    catch (error) {
      console.error('Error starting session:', error);
      return null
    }

  }
}
