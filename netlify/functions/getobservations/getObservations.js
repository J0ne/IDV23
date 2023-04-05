import * as pg from "pg";
const { Client } = pg;

const client = new Client(process.env.DATABASE_URL);

export const handler = async (event) => {
  try {
    console.log(client, event);
    const results = await client.query("SELECT x.* FROM public.observation x");

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
    // // more keys you can return:
    // headers: { "headerName": "headerValue", ... },
    // isBase64Encoded: true,
  } catch (error) {
    client.end();
    return { statusCode: 500, body: error.toString() };
  }
};
