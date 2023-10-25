import {
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

export interface UserStatus {
  name:
    | "online"
    | "offline"
    | "idle"
    | "dnd"
    | "coding"
    | "streaming"
    | "sleeping"
    | "custom";
  icon?: string;
  text?: string;
}

@Table({
  timestamps: true,
  tableName: "users",
  modelName: "User",
})
class User extends Model {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataType.STRING,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    defaultValue: null,
  })
  declare avatar: string | null;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  declare badges: string[];

  @Column({
    type: DataType.STRING,
    defaultValue: null,
  })
  declare banner: string | null;

  @Column({
    type: DataType.STRING,
    defaultValue: null,
  })
  declare bio: string | null;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  declare blocked: string[];

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare bot: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare displayName: string | null;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  declare dms: string[];

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare dob: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare email: string | null;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  declare friends: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  declare guilds: string[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare locale: string;

  @Column({
    type: DataType.DATE,
    defaultValue: Date.now(),
  })
  declare lastLogin: Date;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  declare notifications: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare password: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare secret: string;

  @Column({
    type: DataType.JSON,
    defaultValue: {
      name: "offline",
      icon: null,
      text: null,
    },
    allowNull: false,
  })
  declare status: UserStatus;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare tag: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare username: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare editedAt: Date;
}

export default User;
