import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [dropped, setDropped] = useState(); // fixing animation glich with this
    function addTask(inp) {
        if (inp.trim() !== "") {
            setTasks([...tasks, { id: Date.now(), title: inp, status: false }]);
            // ... --> it is called spread oprator, works just as it looks

        }
    }
    function deleteTask(id) {
        setTasks(tasks.filter((task, i) => (task.id !== id)));
        // react prefers creating new arrays instead of modifiying old ones for state change
        // filter creates new array
    }

    function toggleTask(id) {
        setTasks(tasks.map((t) => (t.id === id) ? { ...t, status: !t.status } : t));
        // chnages the status of task, for checkboxes
    }

    function handleDragEnd(event) {
        setTasks(arrayMove(tasks, tasks.findIndex(t => t.id === event.active.id), tasks.findIndex(t => t.id === event.over.id)));
        // reordering the array according to the drag and drop positions
        setDropped(true);
    }
    function handleDragStart() {
        setDropped(false);
    }

    return { tasks, dropped, addTask, deleteTask, toggleTask, handleDragEnd, handleDragStart }
}

export default useTasks;