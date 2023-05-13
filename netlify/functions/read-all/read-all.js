/* Import faunaDB sdk */
import * as process from "process";
import * as fauna from "faunadb";

const { Client, query } = fauna;
const {
  Paginate,
  Map,
  Match,
  Index,
  Get,
  Lambda,
  Var,
  ToString,
  Select,
  Function: Fn,
} = query;

const client = new Client({
  secret: process.env.FAUNADB_ADMIN_SECRET,
});

export const handler = async (event) => {
  try {
    const response = await client.query(
      //query.Paginate(query.Match(query.Index("all_observations")))
      // query.Paginate(query.Match(query.Index("all_observations")))
      Map(
        Paginate(Match(Index("all_observations2")), { size: 1000 }),
        Lambda("x", {
          id: Select(["data", "id"], Get(Var("x"))),
          type: Select(["data", "type_id"], Get(Var("x"))),
          startTime: ToString(Select(["data", "start_time"], Get(Var("x")))),
          startDate: ToString(Select(["data", "startDate"], Get(Var("x")))),
          state: Select(["data", "state"], Get(Var("x"))),
          modified: Select(["data", "modified"], Get(Var("x"))),
          created: Select(["data", "created"], Get(Var("x"))),
        })
      )
    );
    const itemRefs = response.data;
    // create new query out of item refs. http://bit.ly/2LG3MLg
    // const getAllItemsDataQuery = itemRefs.map((ref) => Get(ref));
    // // then query the refs
    // const ret = await client.query(getAllItemsDataQuery);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.log("error", error);
    return {
      statusCode: 400,
      body: JSON.stringify(error),
    };
  }
};
