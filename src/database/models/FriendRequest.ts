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
import User from "./User";

@Table({
    timestamps: true,
    tableName: "friend_requests",
    modelName: "FriendRequest",
})
class FriendRequest extends Model {
    @Column({
        primaryKey: true,
        allowNull: false,
        type: DataType.STRING,
    })
    declare id: string;

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    declare receiverId: string;

    @BelongsTo(() => User, 'receiverId')
    declare receiver: User;

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
        type: DataType.STRING
    })    
    declare senderId: string;

    @BelongsTo(() => User, 'senderId')
    declare sender: User;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare status: string;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare editedAt: Date;
}

export default FriendRequest;
