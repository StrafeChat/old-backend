import { BelongsTo, BelongsToMany, Column, CreatedAt, DataType, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript";
import User from "./User";
import ChannelRecipient from "./ChannelRecipients";

@Table({
    timestamps: true,
    tableName: "channels",
    modelName: "Channel",
})
class Channel extends Model {
  @Column({
        primaryKey: true,
        allowNull: false,
        type: DataType.STRING,
    })
    declare id: string;

/*
    @Column({
        allowNull: true,
        type: DataType.STRING
    })
    declare guildId: string | null;

    @Column({
        allowNull: true,
        type: DataType.STRING,
    })
    declare icon: string | null;

    @Column({
        allowNull: true,
        type: DataType.STRING,
    })
    declare lastMessageId: string | null;

    @Column({
        allowNull: false,
        type: DataType.STRING, //name, topic, type, id, permissions - for guilds
    })
    declare name: string;

    @ForeignKey(() => User)
    @Column({
        allowNull: true,
        type: DataType.STRING,
    })
    declare ownerId: string | null;

    @BelongsTo(() => User, "ownerId")
    declare owner: User | null;

    @ForeignKey(() => Channel)
    @Column({
        allowNull: true,
        type: DataType.STRING,
    })
    declare parentId: string | null;

    @BelongsTo(() => Channel, "parentId")
    declare parent: Channel | null;

    @Column({
        allowNull: true,
        type: DataType.INTEGER,
    })
    declare position: number | null;


    declare recipientIds: string[];

    // @BelongsToMany(() => User, )
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
        type: DataType.INTEGER
    })
    declare type: number;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare editedAt: Date;
    */
}

export default Channel;