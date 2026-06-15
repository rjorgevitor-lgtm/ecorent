/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  const field = collection.fields.getByName("avatar");
  field.maxSize = 20971520;
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("users");
  const field = collection.fields.getByName("avatar");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.maxSize = 0;
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})