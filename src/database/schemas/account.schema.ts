import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type AccountDocument = mongoose.HydratedDocument<Account>;

@Schema()
export class Account {
  @Prop({ unique: true })
  username: string;

  @Prop()
  followersCount: string;

  @Prop()
  userId: string;

  @Prop({ default: false })
  turnedOffFollowingList: boolean;

  @Prop({ required: false, default: [] })
  _300LessFollowers: any[];

  @Prop({ required: false, default: [] })
  new300LessFollowers: any[];

  @Prop({ required: false, default: [] })
  newAccountsToFollow: any[];

  @Prop({ required: false, default: [] })
  chatIds: any[];
}

export const AccountSchema = SchemaFactory.createForClass(Account);
