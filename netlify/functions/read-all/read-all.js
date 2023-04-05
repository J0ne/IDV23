/* Import faunaDB sdk */
import * as process from "process";
import * as fauna from "faunadb";

const { Client, query } = fauna;

const client = new Client({
  secret: process.env.FAUNADB_ADMIN_SECRET,
});

export const handler = async (event) => {
  console.log("Function `read-all` invoked");

  try {
    const response = await client.query(
      query.Paginate(query.Match(query.Index("observer_index")))
    );
    const itemRefs = response.data;
    // create new query out of item refs. http://bit.ly/2LG3MLg
    const getAllItemsDataQuery = itemRefs.map((ref) => query.Get(ref));
    // then query the refs
    const ret = await client.query(getAllItemsDataQuery);
    return {
      statusCode: 200,
      body: JSON.stringify(ret),
    };
  } catch (error) {
    console.log("error", error);
    return {
      statusCode: 400,
      body: JSON.stringify(error),
    };
  }
};
