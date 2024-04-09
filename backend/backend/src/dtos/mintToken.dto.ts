import { ApiProperty } from "@nestjs/swagger";

export class MintTokenDto {
    @ApiProperty({type: String, required: true, default: process.env.PETER_ADDRESS})
    address: string;
}