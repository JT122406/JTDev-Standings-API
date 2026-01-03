import type {Connection} from "mariadb";
import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import type {Match, WithConnection} from "../../types/types.ts";

import '@fastify/swagger'


const addMatch: (fastify: FastifyInstance, withConnection: WithConnection) => Promise<void> = async(fastify: FastifyInstance, withConnection: WithConnection): Promise<void> => {
    fastify.post<{ Body: Match; Reply: { message: string } | { error: string } }>('/matches',
        {
            schema: {
                tags: ['Matches'],
                description: 'Adds a new Match to the database',
                body: {
                    type: 'object',
                    properties: {
                        gameId: { type: 'number' },
                        teams: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    players: { type: 'array', items: { type: 'number' } },
                                    score: { type: 'number' },
                                    overtime: { type: 'boolean' }
                                }
                            }
                        },
                        createdBy: { type: 'number' }
                    },
                    required: ['gameId', 'teams', 'createdBy']
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            message: { type: 'string' }
                        }
                    }
                }
            }
        },
        async (request: FastifyRequest<{ Body: Match }>, reply: FastifyReply): Promise<void> => {
            return withConnection(async (conn: Connection): Promise<void> => {
                const { gameId, createdBy, teams } = request.body;

                if (!Array.isArray(teams) || teams.length < 2) {
                    reply.code(400).send({ error: 'A match must include at least 2 teams.' });
                    return;
                }

                const seenPlayers = new Set<number>();
                for (const team of teams) {
                    if (!Array.isArray(team.players) || team.players.length === 0) {
                        reply.code(400).send({ error: 'Each team must include at least 1 player.' });
                        return;
                    }
                    for (const pid of team.players) {
                        if (seenPlayers.has(pid)) {
                            reply.code(400).send({ error: `Player ${pid} appears on multiple teams.` });
                            return;
                        }
                        seenPlayers.add(pid);
                    }
                }

                try {
                    await conn.beginTransaction();

                    const matchRes: any = await conn.query(
                        `INSERT INTO Matches (game_id, created_by)
         VALUES (?, ?)`,
                        [gameId, createdBy]
                    );

                    const matchId: number = Number(matchRes.insertId);

                    for (const team of teams) {
                        const teamRes: any = await conn.query(
                            `INSERT INTO MatchTeams (match_id, score, overtime)
           VALUES (?, ?, ?)`,
                            [matchId, team.score, team.overtime ? 1 : 0]
                        );

                        const teamId: number = Number(teamRes.insertId);

                        const rows: Array<[number, number]> = team.players.map((playerId: number) => [teamId, playerId]);

                        await conn.batch(
                            `INSERT INTO TeamPlayers (team_id, player_id)
           VALUES (?, ?)`,
                            rows
                        );
                    }

                    await conn.commit();

                    reply.code(201).send({ id: matchId, message: 'Match created' });
                } catch (err: any) {
                    try { await conn.rollback(); } catch {}

                    if (err?.errno === 1452) {
                        reply.code(400).send({ error: 'Foreign key constraint failed (gameId, createdBy, or a playerId does not exist).' });
                        return;
                    }

                    if (err?.errno === 1062) {
                        reply.code(409).send({ error: 'Duplicate entry (likely duplicate player on the same team).' });
                        return;
                    }

                    request.log.error({ err }, 'Failed to create match');
                    reply.code(500).send({ error: 'Failed to create match' });
                }
            });
        }
    )
}

export default addMatch;