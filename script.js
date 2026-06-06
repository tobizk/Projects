const STORAGE_KEY = "taskTracker.tasks";
const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskDate = document.getElementById("task-date");
const taskPriority = document.getElementById("task-priority");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedButton = document.getElementById("clear-completed");
const taskSearch = document.getElementById("task-search");

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentFilter = "all";
let searchTerm = "";

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = "task-item";
  if (task.completed) item.classList.add("task-completed");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", () => toggleCompletion(task.id));

  const content = document.createElement("div");
  content.className = "task-content";

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("p");
  meta.className = "task-meta";
  meta.innerHTML = `
    <span class="task-tag tag-${task.priority}">${task.priority}</span>
    <span>${formatDate(task.dueDate)}</span>
  `;

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const completeBtn = document.createElement("button");
  completeBtn.type = "button";
  completeBtn.className = "small-btn";
  completeBtn.textContent = task.completed ? "Undo" : "Complete";
  completeBtn.addEventListener("click", () => toggleCompletion(task.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "small-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => removeTask(task.id));

  actions.append(completeBtn, deleteBtn);
  content.append(title, meta);
  item.append(checkbox, content, actions);
  return item;
}

function getFilteredTasks() {
  return tasks
    .filter((task) => {
      if (currentFilter === "active") return !task.completed;
      if (currentFilter === "completed") return task.completed;
      return true;
    })
    .filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()));
}

function renderTasks() {
  taskList.innerHTML = "";
  const visibleTasks = getFilteredTasks();

  if (visibleTasks.length === 0) {
    emptyState.textContent = tasks.length ? "No tasks match your filter." : "No tasks yet. Add a task to get started.";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  visibleTasks.forEach((task) => taskList.appendChild(createTaskElement(task)));
}

function addTask(task) {
  tasks.unshift(task);
  saveTasks();
  renderTasks();
}

function toggleCompletion(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function removeTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

function setFilter(newFilter) {
  currentFilter = newFilter;
  filterButtons.forEach((button) => button.classList.toggle("active", button.dataset.filter === newFilter));
  renderTasks();
}

function handleFormSubmit(event) {
  event.preventDefault();

  const title = taskTitle.value.trim();
  if (!title) return;

  const newTask = {
    id: Date.now().toString(),
    title,
    dueDate: taskDate.value,
    priority: taskPriority.value,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  addTask(newTask);
  taskForm.reset();
  taskTitle.focus();
}

function init() {
  taskForm.addEventListener("submit", handleFormSubmit);
  clearCompletedButton.addEventListener("click", clearCompleted);
  taskSearch.addEventListener("input", (event) => {
    searchTerm = event.target.value;
    renderTasks();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  renderTasks();
}

init();
