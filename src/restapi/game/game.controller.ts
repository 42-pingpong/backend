import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateGameHistoryDto } from './dto/create-game-history.dto';
import { CreateGameResponseDto } from './response/create-game-reponse.dto';

@ApiTags('game')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOperation({ summary: '새로운 game을 생성합니다.' })
  @ApiCreatedResponse({
    description: '게임 정보를 반환합니다.',
    type: CreateGameResponseDto,
  })
  @Post()
  async createGame(@Body() createGameDto: CreateGameDto) {
    return await this.gameService.createGame(createGameDto);
  }

  @ApiOperation({ summary: '새로운 game history를 저장합니다.' })
  @Post('/history')
  async createHistory(@Body() createGameHistoryDto: CreateGameHistoryDto) {
    return await this.gameService.createHistory(createGameHistoryDto);
  }

  @ApiOperation({ summary: '특정 유저의 game history를 가져옵니다.' })
  @Get('/history/:userId')
  async getHistory(@Param('userId') userId: string) {
    return await this.gameService.getHistory(+userId);
  }
}
