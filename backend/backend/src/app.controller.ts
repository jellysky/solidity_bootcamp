import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { MintTokenDto } from './dtos/mintToken.dto';
import { TransferTokenDto } from './dtos/transferToken.dto';
import { DelegateDto } from './dtos/delegate.dto';
import { VoteDto } from './dtos/vote.dto';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('contract-address')
  getContractAddress(){
    return {result: this.appService.getContractAddress()};
  }

  @Get('contract-address-ballot')
  getContractAddressBallot(){
    return {result: this.appService.getContractAddressBallot()};
  }


  @Get('token-name')
  async getTokenName() {
    return {result: await this.appService.getTokenName()};
  }

  @Get('total-supply')
  async getTotalSupply() {
    return {result: await this.appService.getTotalSupply()};
  }

  @Get('token-balance/:address')
  async getTokenBalance(@Param('address') address: string) {
    return {result: await this.appService.getTokenBalance(address)};
  }

  @Get('transaction-receipt')
  async getTransactionReceipt(@Query('hash') hash: string) {
    return {result: await this.appService.getTransactionReceipt(hash)};
  }

  @Get('server-wallet-address')
  getServerWalletAddress() {
    return {result: this.appService.getServerWalletAddress()};
  }

  @Get('check-minter-role')
  async checkMinterRole(@Query('address') address: string) {
    return {result: await this.appService.checkMinterRole(address)};
  }

  @Post('mint-tokens')
  async mintTokens(@Body() body: MintTokenDto) {
    return {result: await this.appService.mintTokens(body.address)};
  }

  @Post('transfer-tokens')
  async transferTokens(@Body() body: TransferTokenDto) {
    return {result: await this.appService.transferTokens(body.from, body.to, body.amount)};
  }

  @Post('delegate')
  async delegate(@Body() body: DelegateDto) {
    return {result: await this.appService.delegate(body.address)};
  }

  @Get('get-votes')
  async getVotes(@Query('address') address: string) {
    return {result: await this.appService.getVotes(address)};
  }

  @Post('vote')
  async vote(@Body() body: VoteDto) {
    return {result: await this.appService.vote(body.proposal, body.amount)};
  }

}
