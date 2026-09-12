// this is useTasks() hook

import { useEffect, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import * as utils from "../utils/taskUtils";
import * as firebaseService from "../services/firebaseService";




function useTasks(user, collectionName) {
    const [tasks, setTasks] = useState([]); // state for tasks list

    const [pendingMaintenance, setPendingMaintenance] = useState(null);


    const [syncing, setSyncing] = useState(false); // for simulating the syncing state

    const [pageForward, setPageForward] = useState(1);
    const [page, setPage] = useState(1);
    const [pageCache, setPageCache] = useState([]);


    useEffect(() => {


        if (!user || pageForward === null) return;


        // for loading all tasks initially
        async function loadTasks() {

            // database query could be unpredictable, so using try-catch
            try {

                const querySnapshot = await firebaseService.fetchUserCollection(user.uid, collectionName, pageCache, pageForward);
                /*  querySnapshot.docs contains
                    the array which has our all task list data, in order
                    to access that data each element in querySnapshot.docs has a
                    function .data(), querySnapshot.docs[0].data() --> (returns one task object containing all data fields,
                    eg -> {id: '17790293017838f9bea49f94148', index: 0, title: 'wake up', status: false} )
                 */

                const { activeTasks, pendingMaintenance, updatedPageCache } = await utils.prepareTasksAndMaintenance(querySnapshot, collectionName, pageCache, pageForward);
                setPendingMaintenance(pendingMaintenance);
                setTasks(activeTasks);
                // setPageBoundaries(page_Boundaries);
                setPageCache(updatedPageCache);
                // setPage(pageNo);
                setPageForward(null);

            } catch (err) {
                console.error("LOAD ERROR:", err);
            }
        }

        loadTasks();
    }, [user, collectionName, pageForward])
    // calling loadtasks() in useeffect so it runs on the start after the render and
    // [] --> (dependancy array) empty makes sure it only runs once after initial render

    useEffect(() => { // this is reponsible for the cleanup and index sync of the firebase db when either 
        // archive or some firebase querry fails

        // changing pageCache value value when tasks changes
        if (collectionName === "archives") {
            setPageCache(prev => {
                console.log("updating cache");

                return prev?.map(p =>
                    p?.page === page
                        ? { ...p, tasks: [...tasks] }
                        : p
                );
            });
        }

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

    function handleForward() {
        if (pageCache[page]) {
            setTasks(pageCache[page].tasks);
        } else {
            setPageForward(2);
        }
        setPage(prev => prev + 1);
    }
    function handleBackword() {
        if (pageCache[page - 2]) {
            setTasks(pageCache[page - 2].tasks);
            setPage(prev => prev - 1);
        }

        setPageForward(null);
        // setTasks();
    }


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



    return { tasks, syncing, page, pageCache, setTasks, addTask, deleteTask, toggleTask, handleForward, handleBackword }
}

export default useTasks;