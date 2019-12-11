## Basic DataStore Example

- [Creating a new Amplify app with DataStore](https://github.com/dabit3/amplify-datastore-example#creating-a-new-amplify-app-using-datastore)
- [Adding DataStore to an existing AppSync API](https://github.com/dabit3/amplify-datastore-example#adding-datastore-to-an-existing-graphql-api)

### Creating a new Amplify app using DataStore

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

### Example app

```js
import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import { DataStore, Predicates } from "@aws-amplify/datastore";
import { Post, PostStatus } from "./models";

function App() {
  const [form, updateForm] = useState({ title: '', rating: '' })
  async function query() {
    const posts = await DataStore.query(Post);
    console.log('posts: ', posts)
    const original = await DataStore.query(Post, "4d5a08f3-d0ac-42bd-a19e-170991a4d79b");

    // await DataStore.save(
    //   Post.copyOf(original, updated => {
    //     updated.title = `title ${Date.now()}`;
    //     updated.status = PostStatus.ACTIVE
    //   })
    // );
  }
  async function create() {
    const postData = {...form, status: PostStatus.INACTIVE}
    await DataStore.save(
      new Post(postData)
    );
    console.log('successfully created new post')
    updateForm({ title: '', rating: '' })
  }
  useEffect(() => {
    query()
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <input type="button" value="QUERY" onClick={query} />
        </div>
        <input
          value={form.title}
          placeholder="title"
          onChange={e => updateForm({ ...form, 'title': e.target.value })}
        />
        <input
          value={form.rating}
          placeholder="rating"
          onChange={e => updateForm({ ...form, 'rating': parseInt(e.target.value) })}
        />
        <button onClick={create}>Create Post</button>
      </header>
    </div>
  );
}

export default App;
```

### Adding DataStore to an existing GraphQL API

First, make sure you are updated to the latest version of the Amplify CLI:

```sh
$ npm install -g @aws-amplify/cli
```

Next, generate the models from your GraphQL schema:

```sh
$ amplify codegen models
```

Next, update the GraphQL API to add the new conflict detection:

```sh
$ amplify update api
? Please select from one of the below mentioned services: GraphQL
? Choose the default authorization type for the API API key
? Enter a description for the API key: test
? After how many days from now the API key should expire (1-365): <your expiration setting>
? Do you want to configure advanced settings for the GraphQL API (Use arrow keys
)
  No, I am done.
❯ Yes, I want to make some additional changes.
? Configure additional auth types? N
? Configure conflict detection? Y
? Select the default resolution strategy: Auto Merge
? Do you want to override default per model settings? N
```

