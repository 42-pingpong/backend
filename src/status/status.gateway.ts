import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@WebSocketGateway()
export class StatusGateway {
  constructor(private readonly statusService: StatusService) {}

  @SubscribeMessage('createStatus')
  create(@MessageBody() createStatusDto: CreateStatusDto) {
    return this.statusService.create(createStatusDto);
  }

  @SubscribeMessage('findAllStatus')
  findAll() {
    return this.statusService.findAll();
  }

  @SubscribeMessage('findOneStatus')
  findOne(@MessageBody() id: number) {
    return this.statusService.findOne(id);
  }

  @SubscribeMessage('updateStatus')
  update(@MessageBody() updateStatusDto: UpdateStatusDto) {
    return this.statusService.update(updateStatusDto.id, updateStatusDto);
  }

  @SubscribeMessage('removeStatus')
  remove(@MessageBody() id: number) {
    return this.statusService.remove(id);
  }
}
