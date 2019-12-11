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