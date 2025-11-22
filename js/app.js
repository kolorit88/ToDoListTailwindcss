// Основной модуль приложения
const TodoApp = (() => {
  // Состояние приложения
  let state = {
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    currentTaskId: null,
    isEditing: false
  };

  // DOM элементы
  const elements = {
    taskForm: document.getElementById('task-form'),
    taskInput: document.getElementById('task-input'),
    taskModal: document.querySelector('.modal-overlay'),
    modalTitle: document.querySelector('.modal-title'),
    activeTasksList: document.querySelector('.active-tasks'),
    completedTasksList: document.querySelector('.completed-tasks'),
    addTaskBtn: document.querySelector('.add-task-btn'),
    cancelBtn: document.querySelector('.cancel-btn'),
    searchInput: document.querySelector('.search-input')
  };

  // Инициализация приложения
  const init = () => {
    renderTasks();
    attachEventListeners();
  };

  // Прикрепление обработчиков событий
  const attachEventListeners = () => {
    elements.addTaskBtn.addEventListener('click', openAddModal);
    elements.cancelBtn.addEventListener('click', closeModal);
    elements.taskForm.addEventListener('submit', handleTaskSubmit);
    elements.searchInput.addEventListener('input', handleSearch);

    // Закрытие модального окна при клике вне его
    elements.taskModal.addEventListener('click', (e) => {
      if (e.target === elements.taskModal) {
        closeModal();
      }
    });
  };

  // Открытие модального окна для добавления задачи
  const openAddModal = () => {
    state.isEditing = false;
    elements.modalTitle.textContent = 'Добавить задачу';
    elements.taskInput.value = '';
    elements.taskModal.classList.add('active');
    elements.taskInput.focus();
  };

  // Открытие модального окна для редактирования задачи
  const openEditModal = (taskId) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      state.isEditing = true;
      state.currentTaskId = taskId;
      elements.modalTitle.textContent = 'Редактировать задачу';
      elements.taskInput.value = task.title;
      elements.taskModal.classList.add('active');
      elements.taskInput.focus();
    }
  };

  // Закрытие модального окна
  const closeModal = () => {
    elements.taskModal.classList.remove('active');
    state.currentTaskId = null;
    state.isEditing = false;
  };

  // Обработка отправки формы
  const handleTaskSubmit = (e) => {
    e.preventDefault();

    const title = elements.taskInput.value.trim();
    if (!title) return;

    if (state.isEditing) {
      updateTask(state.currentTaskId, title);
    } else {
      addTask(title);
    }

    closeModal();
  };

  // Добавление новой задачи
  const addTask = (title) => {
    const newTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };

    state.tasks.unshift(newTask);
    saveTasks();
    renderTasks();
  };

  // Обновление задачи
  const updateTask = (taskId, title) => {
    const taskIndex = state.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      state.tasks[taskIndex].title = title;
      saveTasks();
      renderTasks();
    }
  };

  // Удаление задачи
  const deleteTask = (taskId) => {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      state.tasks = state.tasks.filter(t => t.id !== taskId);
      saveTasks();
      renderTasks();
    }
  };

  // Переключение статуса выполнения задачи
  const toggleTaskCompletion = (taskId) => {
    const taskIndex = state.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      state.tasks[taskIndex].completed = !state.tasks[taskIndex].completed;
      saveTasks();
      renderTasks();
    }
  };

  // Поиск задач
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    renderTasks(searchTerm);
  };

  // Отрисовка задач
  const renderTasks = (searchTerm = '') => {
    const filteredTasks = searchTerm
      ? state.tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm))
      : state.tasks;

    const activeTasks = filteredTasks.filter(task => !task.completed);
    const completedTasks = filteredTasks.filter(task => task.completed);

    renderTaskList(activeTasks, elements.activeTasksList, false);
    renderTaskList(completedTasks, elements.completedTasksList, true);
  };

  // Отрисовка списка задач
  const renderTaskList = (tasks, container, isCompleted) => {
    container.innerHTML = '';

    if (tasks.length === 0) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = 'text-center text-gray-500 py-4';
      emptyMessage.textContent = isCompleted
        ? 'Нет выполненных задач'
        : 'Нет активных задач';
      container.appendChild(emptyMessage);
      return;
    }

    tasks.forEach(task => {
      const taskElement = createTaskElement(task);
      container.appendChild(taskElement);
    });
  };

  // Создание элемента задачи
  const createTaskElement = (task) => {
    const li = document.createElement('li');
    li.className = `task-item bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3 ${task.completed ? 'completed opacity-70' : ''}`;

    li.innerHTML = `
                    <div class="flex items-center flex-1">
                        <input type="checkbox" class="task-checkbox w-5 h-5 text-blue-500 mr-3" ${task.completed ? 'checked' : ''}>
                        <span class="task-title flex-1 ${task.completed ? 'line-through' : ''}">${task.title}</span>
                    </div>
                    <div class="task-actions flex justify-end space-x-2">
                        <button class="edit-btn px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors text-sm">
                            Редактировать
                        </button>
                        <button class="delete-btn px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors text-sm">
                            Удалить
                        </button>
                    </div>
                `;

    // Обработчики событий для элементов задачи
    const checkbox = li.querySelector('.task-checkbox');
    const editBtn = li.querySelector('.edit-btn');
    const deleteBtn = li.querySelector('.delete-btn');

    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
    editBtn.addEventListener('click', () => openEditModal(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    return li;
  };

  // Сохранение задач в localStorage
  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
  };

  // Публичные методы
  return {
    init
  };
})();

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  TodoApp.init();
});
