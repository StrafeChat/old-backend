import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import Room from "./Room";
import Space from "./Space";
import User from "./User";

@Table({
  timestamps: true,
  tableName: "messages",
  modelName: "Message",
})
class Message extends Model {
  @Column({
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare authorId: string | null;
  
  @BelongsTo(() => User, "authorId")
  declare author: User | null;

  @Column({
    type: DataType.TEXT,
    defaultValue: "",
  })
  declare content: string | null;

  @Column({
    type: DataType.ARRAY(DataType.JSON),
    defaultValue: [],
  })
  declare embeds: any[];

  @ForeignKey(() => Room)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare roomId: string;

  @BelongsTo(() => Room, "roomId")
  declare room: Room | null;

  @ForeignKey(() => Space)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare spaceId: string | null;

  @BelongsTo(() => Space, "spaceId")
  declare space: Space | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare tts: boolean | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default Message;
