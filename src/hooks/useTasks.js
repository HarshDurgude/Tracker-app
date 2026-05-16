import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { fakeSaveTask } from "../services/fakeServer";
function useTasks() {
    const [tasks, setTasks] = useState([]); // state for tasks list
    const [dropped, setDropped] = useState(); // fixing animation glich with this
    const [loading, setLoading] = useState(false); // for simulating the loading state

    async function addTask(inp) {
        if (inp.trim() !== "") {

            setLoading(true); // state becomes true so shows loading text

            // new task object
            const newTask = {
                id: Date.now(),
                title: inp,
                status: false
            };
            console.log("UI: updating instantly");

            setTasks(prev => [...prev, newTask]);
            // ... --> it is called spread oprator, works just as it looks

            console.log("UI: sending to server");

            try {
                await fakeSaveTask(newTask);
                // await used here so next code doesnt execute without this executing first

                console.log("saved");

            }
            catch (err) {
                setTasks(prev =>
                    prev.filter(task => task.id !== newTask.id)
                );
                console.log("ERROR:", err);

            }

            console.log("UI: server finished");

            setLoading(false); // stop showing the loading text

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

    return { tasks, dropped, loading, addTask, deleteTask, toggleTask, handleDragEnd, handleDragStart }
}

export default useTasks;