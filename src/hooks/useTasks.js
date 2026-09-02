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

            const { expiredTasks, needsIndexSync } = pendingMaintenance;

            try {
                const archiveCount = await firebaseService.getCollectionCount(user.uid, "archives");
                await firebaseService.archiveExpiredTasksBatch(user.uid, expiredTasks, archiveCount);

            } catch (e) {
                console.log(e);

            }

            // Then fix indexes if necessary
            if (needsIndexSync || expiredTasks.length > 0) {

                await firebaseService.batchSyncIndexes(user.uid, collectionName, tasks);
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
            const newTask = utils.createNewTask(inp, tasks.length);
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
        // chnages the status of task, for checkboxes

        try {
            if (collectionName === "tasks") {
                await firebaseService.updateTaskFieldsDoc(user.uid, "tasks", id, { status: newStatus, completedDate: completedDate });
            } else if (collectionName === "archives") {
                const collectionCount = await firebaseService.getCollectionCount(user.uid, "tasks");
                await firebaseService.addTaskDoc(user.uid, "tasks", { ...task, status: false, completedDate: null, index: collectionCount });
                deleteTask(id);
            }
        } catch (err) {
            console.log("ERR : " + err);
            // rollback can be implemented here if needed
        }

    }

    async function deleteTask(id) {

        if (!id) return; // only delete if firebase id exists

        // LOCAL UI UPDATE
        const updatedAfterDelete = tasks
            .filter((task) => (task.id !== id))
            .map((task, index) => ({
                ...task,
                index
            })); // react prefers creating new arrays instead of modifiying old ones for state change
        // filter creates new array

        setTasks(updatedAfterDelete);

        await firebaseService.deleteTaskDoc(user.uid, collectionName, id);

        if (collectionName === "archives") {
            const invertedTasks = updatedAfterDelete.map((task, index) => ({
                ...task,
                index: updatedAfterDelete.length - 1 - index,
            }));
            await firebaseService.batchSyncIndexes(user.uid, collectionName, invertedTasks);
        } else {
            await firebaseService.batchSyncIndexes(user.uid, collectionName, updatedAfterDelete);
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
        const reordered = arrayMove(tasks, tasks.findIndex(t => t.id === event.active.id), tasks.findIndex(t => t.id === event.over.id));

        const updatedReorder = reordered.map((task, index) => ({
            ...task,
            index
        }));
        setTasks(updatedReorder);

        // DB SYNC

        // console.log("calling db");
        if (collectionName === "archives") {
            const invertedTasks = updatedReorder.map((task, index) => ({
                ...task,
                index: updatedReorder.length - 1 - index,
            }));
            firebaseService.batchSyncIndexes(user.uid, collectionName, invertedTasks);
        } else {
            firebaseService.batchSyncIndexes(user.uid, collectionName, updatedReorder);
        }

        // reordering the array according to the drag and drop positions
        setDropped(true);

    }

    function handleDragStart() {
        setDropped(false);
    }

    return { tasks, dropped, syncing, addTask, deleteTask, toggleTask, handleDragEnd, handleDragStart }
}

export default useTasks;