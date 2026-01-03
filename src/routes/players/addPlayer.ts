import type {Connection} from "mariadb";
import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import type {WithConnection} from "../../types/types.ts";

import '@fastify/swagger'


const addPlayer: (fastify: FastifyInstance, withConnection: WithConnection) => Promise<void> = async(fastify: FastifyInstance, withConnection: WithConnection): Promise<void> => {
    fastify.post<{ Body: { display_name: string }; Reply: { message: string } | { error: string }}>(
        '/players/player',
        {
            schema: {
                tags: ['Players'],
                description: 'Add a new player to the database',
                body: {
                    type: 'object',
                    properties: {
                        display_name: { type: 'string' }
                    },
                    required: ['display_name']
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
        async (request: FastifyRequest<{ Body: { display_name: string } }>, reply: FastifyReply): Promise<void> => {
            return withConnection(async (conn: Connection): Promise<void> => {
                const id: any = await conn.query('INSERT INTO Players (display_name) VALUES (?)', [request.body.display_name]);
                reply.code(201)
                    .header('Location', '/players/player?id=' + id.insertId + '&display_name=' + request.body.display_name + '')
                    .send({ id: id.insertId, message: 'Player added successfully' });
            });
        })
}

export default addPlayer;