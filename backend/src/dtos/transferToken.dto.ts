import { ApiProperty } from "@nestjs/swagger";

export class TransferTokenDto {
    @ApiProperty({type: String, required: true, default: process.env.PETER_ADDRESS})
    from: string;

    @ApiProperty({type: String, required: true, default: process.env.PETER_ADDRESS})
    to: string;

    @ApiProperty({type: String, required: true, default: process.env.PETER_ADDRESS})
    amount: string;

}