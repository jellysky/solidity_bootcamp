import { ApiProperty } from "@nestjs/swagger";

export class VoteDto {
    
    @ApiProperty({type: Number, required: true, default: 2})
    proposal: number;
    
    @ApiProperty({type: String, required: true, default: "1"})
    amount: string;
}