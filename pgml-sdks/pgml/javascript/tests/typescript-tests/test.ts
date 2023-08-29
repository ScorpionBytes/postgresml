import pgml from "../../index.js";

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// PLEASE BE AWARE THESE TESTS DO INVOLVE CHECKS ON LAZILY CREATD DATABASE ITEMS  //
// IF ANY OF THE COLLECTION NAMES ALREADY EXIST, SOME TESTS MAY FAIL              //
// THIS DOES NOT MEAN THE SDK IS BROKEN. PLEASE CLEAR YOUR DATABASE INSTANCE      //
// BEFORE RUNNING ANY TESTS                                                       //
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

const LOG_LEVEL = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "ERROR";
pgml.js_init_logger(LOG_LEVEL);

const generate_dummy_documents = (count: number) => {
  let docs = [];
  for (let i = 0; i < count; i++) {
    docs.push({
      id: i,
      text: `This is a test document: ${i}`,
      project: "a10",
      uuid: i * 10,
      floating_uuid: i * 1.1,
      name: `Test Document ${i}`,
    });
  }
  return docs;
};

///////////////////////////////////////////////////
// Test the API exposed is correct ////////////////
///////////////////////////////////////////////////

it("can create collection", () => {
  let collection = pgml.newCollection("test_j_c_ccc_0");
  expect(collection).toBeTruthy();
});

it("can create model", () => {
  let model = pgml.newModel("test", "openai", {
    some_example_parameter: "test 0123948712394871234987",
  });
  expect(model).toBeTruthy();
});

it("can create splitter", () => {
  let splitter = pgml.newSplitter();
  expect(splitter).toBeTruthy();
});

it("can create pipeline", () => {
  let model = pgml.newModel();
  let splitter = pgml.newSplitter();
  let pipeline = pgml.newPipeline("test_j_p_ccc_0", model, splitter);
  expect(pipeline).toBeTruthy();
});

it("can create builtins", () => {
  let builtins = pgml.newBuiltins();
  expect(builtins).toBeTruthy();
});

///////////////////////////////////////////////////
// Test various vector searches ///////////////////
///////////////////////////////////////////////////

it("can vector search with local embeddings", async () => {
  let model = pgml.newModel();
  let splitter = pgml.newSplitter();
  let pipeline = pgml.newPipeline("test_j_p_cvswle_0", model, splitter);
  let collection = pgml.newCollection("test_j_c_cvswle_3");
  await collection.upsert_documents(generate_dummy_documents(3));
  await collection.add_pipeline(pipeline);
  let results = await collection.vector_search("Here is some query", pipeline);
  expect(results).toHaveLength(3);
  await collection.archive();
});

it("can vector search with remote embeddings", async () => {
  let model = pgml.newModel("text-embedding-ada-002", "openai");
  let splitter = pgml.newSplitter();
  let pipeline = pgml.newPipeline("test_j_p_cvswre_0", model, splitter);
  let collection = pgml.newCollection("test_j_c_cvswre_1");
  await collection.upsert_documents(generate_dummy_documents(3));
  await collection.add_pipeline(pipeline);
  let results = await collection.vector_search("Here is some query", pipeline);
  expect(results).toHaveLength(3);
  await collection.archive();
});

it("can vector search with query builder", async () => {
  let model = pgml.newModel();
  let splitter = pgml.newSplitter();
  let pipeline = pgml.newPipeline("test_j_p_cvswqb_0", model, splitter);
  let collection = pgml.newCollection("test_j_c_cvswqb_1");
  await collection.upsert_documents(generate_dummy_documents(3));
  await collection.add_pipeline(pipeline);
  let results = await collection
    .query()
    .vector_recall("Here is some query", pipeline)
    .limit(10)
    .fetch_all();
  expect(results).toHaveLength(3);
  await collection.archive();
});

it("can vector search with query builder with remote embeddings", async () => {
  let model = pgml.newModel("text-embedding-ada-002", "openai");
  let splitter = pgml.newSplitter();
  let pipeline = pgml.newPipeline("test_j_p_cvswqbwre_0", model, splitter);
  let collection = pgml.newCollection("test_j_c_cvswqbwre_1");
  await collection.upsert_documents(generate_dummy_documents(3));
  await collection.add_pipeline(pipeline);
  let results = await collection
    .query()
    .vector_recall("Here is some query", pipeline)
    .limit(10)
    .fetch_all();
  expect(results).toHaveLength(3);
  await collection.archive();
});

it("can vector search with query builder and metadata filtering", async () => {
  let model = pgml.newModel();
  let splitter = pgml.newSplitter();
  let pipeline = pgml.newPipeline("test_j_p_cvswqbamf_0", model, splitter);
  let collection = pgml.newCollection("test_j_c_cvswqbamf_4");
  await collection.upsert_documents(generate_dummy_documents(3));
  await collection.add_pipeline(pipeline);
  let results = await collection
    .query()
    .vector_recall("Here is some query", pipeline)
    .filter({
      metadata: {
        $or: [{ uuid: { $eq: 0 } }, { floating_uuid: { $lt: 2 } }],
        project: { $eq: "a10" },
      },
    })
    .limit(10)
    .fetch_all();
  expect(results).toHaveLength(2);
  await collection.archive();
});

///////////////////////////////////////////////////
// Test user output facing functions //////////////
///////////////////////////////////////////////////

it("pipeline to dict", async () => {
  let model = pgml.newModel("text-embedding-ada-002", "openai");
  let splitter = pgml.newSplitter();
  let pipeline = pgml.newPipeline("test_j_p_ptd_0", model, splitter);
  let collection = pgml.newCollection("test_j_c_ptd_2");
  await collection.add_pipeline(pipeline);
  let pipeline_dict = await pipeline.to_dict();
  expect(pipeline_dict["name"]).toBe("test_j_p_ptd_0");
  await collection.archive();
});