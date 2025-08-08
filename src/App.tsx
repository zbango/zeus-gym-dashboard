import { useEffect, useState } from "react";

import supabase from "./lib/supabaseClient";

function App() {
  const [todos, setTodos] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function getTodos() {
      const { data: todos } = await supabase.from("instruments").select();
      if (todos && todos.length > 1) {
        setTodos(todos);
      }
    }

    getTodos();
  }, []);

  return (
    <div>
      <h1>Todos</h1>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </div>
  );
}
export default App;
