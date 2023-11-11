import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import User from "./User";
import Room from "./Room";

@Table({
    tableName: "room_recipients",
    modelName: "RoomRecipient"
})
class RoomRecipient extends Model {
    @ForeignKey(() => Room)
    @Column({
        allowNull: false,
        type: DataType.STRING,
    })
    declare roomId: string;

    @BelongsTo(() => Room)
    declare room: Room;

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
        type: DataType.STRING,
    })
    declare userId: string;

    @BelongsTo(() => User)
    declare user: User;
}

export default RoomRecipient;