
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import Channel from "./Channel";
import User from "./User";

@Table({
    tableName: "channel-recipients",
    modelName: "ChannelRecipient"
})
class ChannelRecipient extends Model {
    //@ForeignKey(() => Channel)
   /* @Column({
        allowNull: false,
        type: DataType.STRING,
    })
    declare channelId: string;

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
        type: DataType.STRING,
    })
    declare userId: string;

    //@BelongsTo(() => Channel)
   // declare channel: Channel;

    @BelongsTo(() => User)
    declare user: User;
    */
}

export default ChannelRecipient;