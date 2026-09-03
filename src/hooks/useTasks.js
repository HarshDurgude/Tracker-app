// this is useTasks() hook

import { useEffect, useState, useRef } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import * as utils from "../utils/taskUtils"
import * as firebaseService from "../services/firebaseService";


function useTasks(user, collectionName) {
    const [tasks, setTasks] = useState([]); // state for tasks list
    const [pendingMaintenance, setPendingMaintenance] = useState(null);

    const [dropped, setDropped] = useState(); // fixing animation glich with this
    const [syncing, setSyncing] = useState(false); // for simulating the syncing state

    useEffect(() => {

        if (!user) return;

        // for loading all tasks initially
        async function loadTasks() {

            // database query could be unpredictable, so using try-catch
            try {
                const sortOrder = collectionName === "archives" ? "desc" : "asc";
                const querySnapshot = await firebaseService.fetchUserCollection(user.uid, collectionName, sortOrder);
                // querySnapshot.docs contains the array which has our all task list data, in order
                // to access that data each element in querySnapshot.docs has a 
                // function .data(), querySnapshot.docs[0].data() --> (returns one task object containing all data fields, 
                // eg -> {id: '17790293017838f9bea49f94148', index: 0, title: 'wake up', status: false} )

                if (collectionName === "tasks") {
                    const { activeTasks, pendingMaintenance } = utils.prepareTasksAndMaintenance(querySnapshot);
                    setPendingMaintenance(pendingMaintenance);
                    setTasks(activeTasks);
                } else {
                    setTasks(querySnapshot.docs.map((docSnap) => docSnap.data()));
                }
            } catch (err) {
                console.error("LOAD ERROR:", err);
            }
        }

        loadTasks();
    }, [user, collectionName])
    // calling loadtasks() in useeffect so it runs on the start after the render and
    // [] --> (dependancy array) empty makes sure it only runs once after initial render

    useEffect(() => { // this is reponsible for the cleanup and index sync of the firebase db when either 
        // archive or some firebase querry fails
        if (!pendingMaintenance) return;

        async function cleanupFirebase() {

            const { expiredTasks } = pendingMaintenance;

            try {
                const nextIndex = await firebaseService.getNextIndex(user.uid, "archives");
                await firebaseService.archiveExpiredTasksBatch(user.uid, expiredTasks, nextIndex);
            } catch (e) {
                console.log(e);
            }

            setPendingMaintenance(null);
        }
        cleanupFirebase();

    }, [pendingMaintenance, user, tasks, collectionName]);


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
        setTasks((prev) => (prev.map((t) => ((t.id === id) ? { ...t, status: newStatus, completedDate: completedDate } : t))));
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

    function handleDragEnd(event) {

        if (!event.over || event.active.id === event.over.id) {
            setDropped(true);
            return;
            // handling the case of dropped at the same position and dropping
            // below the last element
        }

        // LOCAL UI UPDATE
        // index from where we dragged the task
        const dragIndex = tasks.findIndex(task => task.id === event.active.id);
        // index to where we dragged the task
        const dropIndex = tasks.findIndex(task => task.id === event.over.id);
        // reordering the array according to drag and drop 
        const reordered = arrayMove(tasks, dragIndex, dropIndex);
        // Calculating the new index for dragged task only
        const calculatedIndex = utils.calculateDragIndex(reordered, dropIndex);
        // asign that new index to dragged task in reordered array
        reordered[dropIndex].index = calculatedIndex;

        setTasks(reordered);

        // DB SYNC - only ONE document
        try {
            firebaseService.updateTaskFieldsDoc(
                user.uid,
                collectionName,
                reordered[dropIndex].id,
                { index: calculatedIndex }
            );
        } catch (err) {
            console.log("DRAG SYNC ERROR:", err);
        }

        setDropped(true);

    }

    function handleDragStart() {
        setDropped(false);
    }

    return { tasks, dropped, syncing, addTask, deleteTask, toggleTask, handleDragEnd, handleDragStart }
}

export default useTasks;