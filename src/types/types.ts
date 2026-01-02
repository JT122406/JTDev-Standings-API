import type {Pool} from "mariadb";

export type MariaConn = Awaited<ReturnType<Pool['getConnection']>>;

export type WithConnection = <T>(fn: (conn: MariaConn) => Promise<T>) => Promise<T>;