import mysql from "mysql2";

export default class Database {
  public static async connect({
    host,
    user,
    password,
    database,
  }: {
    host: string;
    user: string;
    password: string;
    database: string;
  }) {
    return mysql.createPool({ host, user, password, database }).promise();
  }
}
