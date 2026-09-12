// this is useTasks() hook

import { useState } from "react";
import * as utils from "../utils/taskUtils";
import * as firebaseService from "../services/firebaseService";




function useTasks(user, collectionName) {

    const [tasks, setTasks] = useState([]); // state for tasks list

    const [syncing, setSyncing] = useState(false); // for simulating the syncing state


    async function addTask(inp) {

        const inputValidation = utils.validateInput(inp, tasks);

        if (inputValidation.success) {

            setSyncing(true); // state becomes true so shows loading text

            // LOCAL UI UPDATE
            // const newTask = utils.createNewTask(inp, tasks.length);
            const nextIndex = await firebaseService.getNextIndex(user.uid, "tasks");
            const newTask = utils.createNewTask(inp, nextIndex);
            setTasks(prev => [...prev, newTask]);
            // ... --> it is called spread oprator, works just as it looks

            // DB SYNC
            try {// await used here so next code doesnt execute without this executing first
                await firebaseService.addTaskDoc(user.uid, collectionName, newTask);
            } catch (err) { // rollback if adding doesnt work
                setTasks(prev => prev.filter(task => task.id !== newTask.id));
                console.log("ERROR:", err);
            }

            setSyncing(false); // stop showing the loading text

            return { success: true, message: "Added task" }
        } else {
            return inputValidation;
        }
    }

    async function toggleTask(id) {
        if (!id) return; // only toggle if firebase id exists

        // LOCAL UI UPDATE
        const task = tasks.find(t => t.id === id);
        const newStatus = !task.status;
        const completedDate = newStatus ? utils.getTodayDate() : null;
        // const updatedTasks = tasks.map((t) => ((t.id === id) ? { ...t, status: newStatus, completedDate: completedDate } : t));
        setTasks(prev => prev.map((t) => ((t.id === id) ? { ...t, status: newStatus, completedDate: completedDate } : t)));
        // changes the status of task, for checkboxes

        try {
            if (collectionName === "tasks") {
                await firebaseService.updateTaskFieldsDoc(user.uid, "tasks", id, { status: newStatus, completedDate: completedDate });

            } else if (collectionName === "archives") {

                const nextIndex = await firebaseService.getNextIndex(user.uid, "tasks");
                await firebaseService.addTaskDoc(user.uid, "tasks",
                    {
                        ...task,
                        status: false,
                        completedDate: null,
                        index: nextIndex
                    });
                await deleteTask(id);
            }
        } catch (err) {
            console.log("ERR : " + err);
            // rollback can be implemented here if needed
        }

    }


    async function deleteTask(id) {

        if (!id) return;

        // LOCAL UI UPDATE
        setTasks(prev =>
            prev.filter(task => task.id !== id)
        );

        // DB SYNC
        try {
            await firebaseService.deleteTaskDoc(user.uid, collectionName, id);
        } catch (err) {
            console.log("DELETE ERROR:", err);
        }
    }



    return { syncing, tasks, setTasks, addTask, deleteTask, toggleTask }
}

export default useTasks;