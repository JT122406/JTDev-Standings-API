import type {Pool} from "mariadb";

export type MariaConn = Awaited<ReturnType<Pool['getConnection']>>;

export type WithConnection = <T>(fn: (conn: MariaConn) => Promise<T>) => Promise<T>;

export type MatchTeam = {
    players: number[],
    score: number,
    overtime: boolean
}

export type Match = {
    gameId: number,
    teams: MatchTeam[]
    createdBy: number
};