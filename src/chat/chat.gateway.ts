import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

// The @WebSocketGateway() decorator defines the WebSocket server.
@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
  //ping을 보내고 pong을 받지 못하면 연결을 끊는다.
  pingTimeout: 2500,
  //ping을 보내는 주기 1000ms = 1초
  pingInterval: 5000,
  //namespace에 성공적으로 연결되지 않으면 connectTimeout이후 연결을 끊는다.
  connectTimeout: 5,
  transports: ['websocket'],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  /**
   * @brief lifecycle hook
   * @param any server(서버)
   * @return void
   * @description
   * - 서버가 초기화 되었을 때 실행되는 함수
   * - 즉, Nest Injector가 생성되고 ChatGateway 인스턴스가 만들어진 후에 실행된다.
   * - Redis 서버에 연결하거나, 다른 서버에 연결하는 등의 작업을 할 수 있다.
   */
  afterInit(server: any) {
    console.log('afterInit');
  }

  /**
   * @brief lifecycle hook
   * @param any client(클라이언트)
   * @param any][] args(인자).
   */
  @SubscribeMessage('chat-login')
  handleConnection(client: any, ...args: any[]) {
    console.log('handleConnection', args);
  }

  @SubscribeMessage('chat-logout')
  handleDisconnect(client: any, ...args: any[]) {
    console.log('handleDisconnect', args);
    return 'Goodbye world!';
  }

  @SubscribeMessage('chat-message')
  handleMessage(client: any, ...payload: any[]): string {
    console.log('chat-message', payload);
    return 'Message received!';
  }
}
