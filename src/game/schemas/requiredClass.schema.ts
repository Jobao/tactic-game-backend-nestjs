import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TupleRequiredClassDocument = TupleRequiredClass & Document;

@Schema({ id: false })
export class TupleRequiredClass {
  @Prop()
  _id: string;
  @Prop()
  requiredLevel: number;
}

export const TupleRequiredClassSchema =
  SchemaFactory.createForClass(TupleRequiredClass);
TupleRequiredClassSchema.loadClass(TupleRequiredClass);
