import { useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { fakeSaveTask } from "../services/fakeServer";
import { db } from "../services/firebase";
import {
    collection,
    setDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from "firebase/firestore";

function useTasks(user) {
    const [tasks, setTasks] = useState([]); // state for tasks list
    const [dropped, setDropped] = useState(); // fixing animation glich with this
    const [syncing, setSyncing] = useState(false); // for simulating the syncing state

    useEffect(() => {

        if (!user) return;

        loadTasks();

    }, [user]);
    // calling loadtasks() in useeffect so it runs on the start after the render and 
    // [] --> (dependancy array) makes sure it only runs once after initial render

    // for loading all tasks initially
    async function loadTasks() {

        console.log("LOADING: requesting tasks");

        // database query could be unpredictable, so using try-catch
        try {

            const q = query(// using query and orderby func to get things in order by index 
                // beacuse firestore doesnt store elements in order
                collection(db, "users", user.uid, "tasks"),
                orderBy("index")
            );

            // using await cause database query takes time 
            const querySnapshot = await getDocs(q); // this returns a querySnapshot
            // querySnapshot.docs contains the array which has our all task list data, in order
            // to access that data each element in querySnapshot.docs has a 
            // function .data(), querySnapshot.docs[0].data() --> (returns one task object containing all data fields, 
            // eg -> {id: '17790293017838f9bea49f94148', index: 0, title: 'wake up', status: false} )

            const loadedTasks = querySnapshot.docs.map((doc) => (doc.data())); // getting tasks into the local variable from firebase one by one using map

            setTasks(loadedTasks); // updating the tasks state variable

            console.log("LOADING: tasks loaded");

        } catch (err) {
            console.log("LOAD ERROR:", err);

        }
        console.log("LOADING: Firebase responded");
    }

    // syncs task order indexes whenever we rearrange tasks with drag and drop or delete 
    async function syncTaskOrder(updatedTasks) {

        for (const task of updatedTasks) {
            // updating each doc's/task's index one by one
            try {
                const ref = doc(
                    db,
                    "users",
                    user.uid,
                    "tasks",
                    task.id
                )
                await updateDoc(ref, {
                    index: task.index
                });

            } catch (err) {
                console.log(err);

            }

        }

    }

    async function addTask(inp) {
        if (inp.trim() === "") {
            return { success: false, message: "Empty Task" }
        } // .some() -> array method which returns true if at least one elemnet satisfies the condition 
        else if (tasks.some((task) => task.title.toLowerCase().trim() === inp.toLowerCase().trim())) {
            return { success: false, message: "Duplicate task" }
        }
        else {

            setSyncing(true); // state becomes true so shows loading text

            // LOCAL UI UPDATE

            // creating unique id
            const id =
                Date.now().toString() +
                Math.random().toString(16).slice(2);

            // new task object
            const newTask = {
                id,
                title: inp,
                status: false,
                index: tasks.length
            };
            console.log("UI: updating instantly");

            setTasks(prev => [...prev, newTask]);
            // ... --> it is called spread oprator, works just as it looks


            // DB SYNC
            console.log("UI: sending to Firebase");

            try {

                // before we used addDoc but it didnt allow giving our own firebaseId so we
                // are using seDoc() so we can give our id so same copy stays on local & cloud
                const docRef = await setDoc(
                    doc(
                        db,
                        "users",
                        user.uid,
                        "tasks",
                        id
                    ),
                    newTask
                );
                // await used here so next code doesnt execute without this executing first

                console.log("saved");

            }
            catch (err) {
                // rollback if adding doesnt work
                setTasks(prev =>
                    prev.filter(task => task.id !== id)
                );
                console.log("ERROR:", err);

            }

            console.log("UI: server finished");

            setSyncing(false); // stop showing the loading text
            return { success: true, message: "Added task" }
        }
    }

    async function deleteTask(id) {

        if (!id) return; // only delete if firebase id exists

        // LOCAL UI UPDATE
        const deleted = tasks.filter((task, i) => (task.id !== id));
        // react prefers creating new arrays instead of modifiying old ones for state change
        // filter creates new array

        const updatedDelete = deleted.map((task, index) => ({
            ...task,
            index
        }))

        setTasks(updatedDelete);

        // DB SYNC
        try {
            const ref = doc(
                db,
                "users",
                user.uid,
                "tasks",
                id
            );
            await deleteDoc(ref);
        } catch (err) {
            console.log("Err : " + err);
        }
        syncTaskOrder(updatedDelete);

    }

    async function toggleTask(id) {

        if (!id) return; // only toggle if firebase id exists

        // LOCAL UI UPDATE
        const task = tasks.find(
            t => t.id === id
        );
        const newStatus = !task.status;
        setTasks((prev) => prev.map((t) => (t.id === id) ? { ...t, status: newStatus } : t));
        // chnages the status of task, for checkboxes

        // DB SYNC
        try {

            const ref = doc(
                db,
                "users",
                user.uid,
                "tasks",
                id
            );
            await updateDoc(ref, { status: newStatus })
        } catch (err) {
            console.log("ERR : " + err);

        }

    }

    function handleDragEnd(event) {

        // LOCAL UI UPDATE
        const reordered = arrayMove(tasks, tasks.findIndex(t => t.id === event.active.id), tasks.findIndex(t => t.id === event.over.id));

        const updatedReorder = reordered.map((task, index) => ({
            ...task,
            index
        }))
        setTasks(updatedReorder);

        // DB SYNC
        syncTaskOrder(updatedReorder);

        // reordering the array according to the drag and drop positions
        setDropped(true);
    }
    function handleDragStart() {
        setDropped(false);
    }

    return { tasks, dropped, syncing, addTask, deleteTask, toggleTask, handleDragEnd, handleDragStart }
}

export default useTasks;