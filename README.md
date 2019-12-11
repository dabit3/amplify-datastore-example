## Basic DataStore Example

The fastest way to get started is using the amplify-app npx script such as with Create React app:

```sh
$ npx create-react-app amplify-datastore --use-npm
$ cd amplify-datastore
$ npx amplify-app@latest
```

Once this completes open the GraphQL schema in the __amplify/backend/api/<datasourcename>/schema.graphql__. You can use the sample or the one below that will be used in this example:

```graphql
enum PostStatus {
  ACTIVE
  INACTIVE
}

type Post @model {
  id: ID!
  title: String!
  rating: Int!
  status: PostStatus!
}
```

Next, we'll run the model code generation from the GraphQL Schema:

```sh
$ npm run amplify-modelgen
```

Next, we'll install the dependencies:

```sh
$ npm i @aws-amplify/core @aws-amplify/datastore
```

Then, import the necessary dependencies in __src/App.js__:

```js
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { Post, PostStatus } from "./models";
```

Now, let's look at the different types of operations.

### Saving data

```js
await DataStore.save(
  new Post({
    title: `My First Post`,
    rating: 10,
    status: PostStatus.ACTIVE
  })
);
```

### Querying data

Query all data:

```js
const posts = await DataStore.query(Post);
```

Passing in a limit:

```js
const posts = await DataStore.query(Post, null, {
  page: 0,
  limit: 100
});
```

Query with a predicate.

Available predicates:

__Strings__: `eq | ne | le | lt | ge | gt | contains | notContains | beginsWith | between`

```js
// query greater than 4
const posts = await DataStore.query(Post, c => c.rating("gt", 4));

// query posts equal to "My First Post"
const posts = await DataStore.query(Post, c => c.title("eq", "My First Post"));

// chaining multiple commands
const posts = await DataStore.query(Post, c => c.rating("gt", 4).status("eq", PostStatus.ACTIVE));

// query posts containing "First"
const posts = await DataStore.query(Post, c => c.title("contains", "First"));
```

### Updating data

Models in DataStore are immutable. To update a record you must use the .copyOf function to apply updates to the item’s fields rather than mutating the instance directly:

```js
const original = await DataStore.query(Post, "123");

await DataStore.save(
	Post.copyOf(original, updated => {
		updated.status = PostStatus.ACTIVE
	})
);
```

### Delete Data

To delete an item pass in an instance:

```js
const todelete = await DataStore.query(Post, "1234567");
DataStore.delete(todelete);
```

You can also pass predicate operators to delete multiple items. For example will delete all inactive posts:

```js
await DataStore.delete(Post, c => c.status("eq", PostStatus.INACTIVE));
```

Additionally you can perform a conditional delete, for instance only delete if a post is inactive by passing in an instance of a model:

```js
const todelete = await DataStore.query(Post, "123");
DataStore.delete(todelete, c => c.status("eq", PostStatus.INACTIVE));
```

### Observe Data

You can subscribe to changes on your Models by using `observe` in the DataStore API. This reacts dynamically to updates of data to the underlying Storage Engine, which could be the result of GraphQL Subscriptions as well as Queries or Mutations that run against the backing AppSync API if you are synchronizing with the cloud.

```js
const subscription = DataStore.observe(Post).subscribe(msg => {
  console.log(msg.model, msg.opType, msg.element);
})
```