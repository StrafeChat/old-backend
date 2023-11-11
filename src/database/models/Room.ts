import {
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import User from "./User";
import RoomRecipient from "./RoomRecipient";

@Table({
  timestamps: true,
  tableName: "rooms",
  modelName: "Room",
})
class Room extends Model {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataType.STRING,
  })
  declare id: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  declare spaceId: string | null;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  declare icon: string | null;

  @Column({
    allowNull: true,
    type: DataType.STRING, //name, topic, type, id, permissions - for spaces
  })
  declare name: string | null;

  @ForeignKey(() => User)
  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  declare ownerId: string | null;

  @BelongsTo(() => User, "ownerId")
  declare owner: User | null;

  @ForeignKey(() => Room)
  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  declare parentId: string | null;

  @BelongsTo(() => Room, "parentId")
  declare parent: Room | null;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
  })
  declare position: number | null;

  @BelongsToMany(() => User, () => RoomRecipient)
  declare recipients: User[] | null;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  declare topic: string;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
  })
  declare totalMessagesSent: number | null;

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare type: number;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare editedAt: Date;
}

export default Room;
