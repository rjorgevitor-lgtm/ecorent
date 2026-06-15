/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("messages");
  collection.indexes.push("CREATE INDEX idx_messages_conversation ON messages (sender_id, receiver_id)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("messages");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_messages_conversation"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})