const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const counter = document.getElementById("counter");
const filterButtons = document.querySelectorAll(".filter");
const clearCompletedBtn = document.getElementById("clear-completed");
const clearAllBtn = document.getElementById("clear-all");

let todos = [];
let currentFilter = "all";

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function getVisibleTodos() {
  if (currentFilter === "active") return todos.filter((t) => !t.completed);
  if (currentFilter === "completed") return todos.filter((t) => t.completed);
  return todos;
}

function startEditing(todo, label) {
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = todo.text;
  label.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  let finished = false;

  function commit() {
    if (finished) return;
    finished = true;
    const value = editInput.value.trim();
    if (value) {
      todo.text = value;
    } else {
      todos = todos.filter((t) => t.id !== todo.id);
    }
    save();
    render();
  }

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") {
      finished = true;
      render();
    }
  });

  editInput.addEventListener("blur", commit);
}

function createItem(todo) {
  const li = document.createElement("li");
  li.className = "todo-item" + (todo.completed ? " done" : "");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", () => {
    todo.completed = checkbox.checked;
    save();
    render();
  });

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = todo.text;
  label.addEventListener("dblclick", () => startEditing(todo, label));

  const del = document.createElement("button");
  del.className = "delete";
  del.textContent = "✕";
  del.setAttribute("aria-label", "Delete todo");
  del.addEventListener("click", () => {
    todos = todos.filter((t) => t.id !== todo.id);
    save();
    render();
  });

  li.append(checkbox, label, del);
  return li;
}

function render() {
  list.innerHTML = "";
  const visible = getVisibleTodos();

  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Nothing here yet";
    list.appendChild(empty);
  } else {
    visible.forEach((todo) => list.appendChild(createItem(todo)));
  }

  const left = todos.filter((t) => !t.completed).length;
  counter.textContent = left + (left === 1 ? " item left" : " items left");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ id: Date.now(), text, completed: false });
  input.value = "";
  save();
  render();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.completed);
  save();
  render();
});

clearAllBtn.addEventListener("click", () => {
  todos = [];
  save();
  render();
});

render();
