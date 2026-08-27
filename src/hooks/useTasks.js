import { useEffect, useState, useRef } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { db } from "../services/firebase";
import {
    collection,
    setDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    getCountFromServer
} from "firebase/firestore";

function useTasks(user, list) {
    const [tasks, setTasks] = useState([]); // state for tasks list
    const [pendingMaintenance, setPendingMaintenance] = useState(null);

    const [dropped, setDropped] = useState(); // fixing animation glich with this
    const [syncing, setSyncing] = useState(false); // for simulating the syncing state

    useEffect(() => {

        if (!user) return;


        loadTasks();
    }, [user])

    // calling loadtasks() in useeffect so it runs on the start after the render and 
    // [] --> (dependancy array) empty makes sure it only runs once after initial render

    useEffect(() => { // this is reponsible for the cleanup and index sync of the firebase db when either 
        // archive, some firebase querry fails
        if (!pendingMaintenance) return;

        console.log("started useeffect");


        cleanupFirebase();

    }, [pendingMaintenance]);

    function getTodayDate() {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function prepareTasksAndMaintenance(querySnapshot) {
        // const todayDate = getTodayDate(); // today's date -> ${year}-${month}-${day}
        const todayDate = "2026-08-28";


        let indexMismatch = false;

        const loadedTasks = querySnapshot.docs.map((docSnap, ind) => {
            const task = docSnap.data();
            if (task.index !== ind) {
                indexMismatch = true; // if index Mismatch is occured then that means last syncTaskOrderFirebase()
                // didnt perform properly
            }
            return { ...task, index: ind }
        });


        const expiredTasks = loadedTasks.filter(task => task.status && task.completedDate !== todayDate);


        const activeTasks = loadedTasks
            .filter(task => !expiredTasks.includes(task))
            .map((task, index) => ({
                ...task,
                index
            }));


        setPendingMaintenance({
            expiredTasks,
            needsIndexSync: indexMismatch
        });

        return activeTasks;
    }

    // for loading all tasks initially
    async function loadTasks() {

        console.log("LOADING: requesting tasks");

        // database query could be unpredictable, so using try-catch
        try {

            const q = query(// using query and orderby func to get things in order by index 
                // beacuse firestore doesnt store elements in order
                collection(db, "users", user.uid, list),
                orderBy("index")
            );

            // using await cause database query takes time 
            const querySnapshot = await getDocs(q); // this returns a querySnapshot
            // querySnapshot.docs contains the array which has our all task list data, in order
            // to access that data each element in querySnapshot.docs has a 
            // function .data(), querySnapshot.docs[0].data() --> (returns one task object containing all data fields, 
            // eg -> {id: '17790293017838f9bea49f94148', index: 0, title: 'wake up', status: false} )


            const activeTasks = (list === "tasks") ? prepareTasksAndMaintenance(querySnapshot) : querySnapshot.docs.map((docSnap) => docSnap.data());

            setTasks(activeTasks);

            console.log("LOADING: tasks loaded");



        } catch (err) {
            console.error("LOAD ERROR:", err);
            console.error("STACK:", err.stack);
        }
        console.log("LOADING: Firebase responded");
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
                index: tasks.length,
                completedDate: null
            };
            console.log("UI: updating instantly");

            setTasks(prev => [...prev, newTask]);
            // ... --> it is called spread oprator, works just as it looks


            // DB SYNC
            console.log("UI: sending to Firebase");

            try {

                // before we used addDoc but it didnt allow giving our own firebaseId so we
                // are using setDoc() so we can give our id so same copy stays on local & cloud
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

    async function toggleTask(id) {

        if (!id) return; // only toggle if firebase id exists

        // LOCAL UI UPDATE
        const task = tasks.find(
            t => t.id === id
        );
        const newStatus = !task.status;
        const completedDate = newStatus ? getTodayDate() : null;
        const stateBeforeToggle = tasks;
        setTasks((prev) => prev.map((t) => (t.id === id) ? { ...t, status: newStatus, completedDate: completedDate } : t));
        // chnages the status of task, for checkboxes

        if (list === "tasks") {
            // DB SYNC
            try {

                const ref = doc(
                    db,
                    "users",
                    user.uid,
                    list,
                    id
                );
                await updateDoc(ref, { status: newStatus, completedDate: completedDate })
            } catch (err) {
                console.log("ERR : " + err);

            }
        } else {
            try {

                const tasksRef = collection(
                    db,
                    "users",
                    user.uid,
                    "tasks"
                );

                const snapshot = await getCountFromServer(tasksRef);

                const taskCount = snapshot.data().count;


                // before we used addDoc but it didnt allow giving our own firebaseId so we
                // are using setDoc() so we can give our id so same copy stays on local & cloud
                const docRef = await setDoc(
                    doc(
                        db,
                        "users",
                        user.uid,
                        "tasks",
                        id
                    ),
                    { ...task, status: false, completedDate: null, index: taskCount }
                );
                // await used here so next code doesnt execute without this executing first

                deleteTask(id);

            }
            catch (err) {
                // rollback if adding doesnt work
                setTasks(stateBeforeToggle);
                console.log("ERROR:", err);

            }
        }


    }

    function deleteTask(id) {

        if (!id) return; // only delete if firebase id exists


        // LOCAL UI UPDATE
        const updatedAfterDelete = tasks
            .filter((task) => (task.id !== id))
            .map((task, index) => ({
                ...task,
                index
            }));
        // react prefers creating new arrays instead of modifiying old ones for state change
        // filter creates new array

        setTasks(updatedAfterDelete);

        deleteTaskFromFirebase(id);

        syncTaskOrderFirebase(updatedAfterDelete);


    }

    async function deleteTaskFromFirebase(id) {
        console.log(">>> DELETE START", id);
        // DB SYNC
        try {
            const ref = doc(
                db,
                "users",
                user.uid,
                list,
                id
            );
            await deleteDoc(ref);
        } catch (err) {
            console.log("Err : " + err);
        }
    }


    async function cleanupFirebase() {

        const { expiredTasks, needsIndexSync } = pendingMaintenance;

        // First archive and delete expired tasks
        for (const task of expiredTasks) {

            const success = await archiveTaskToFirebase(task);

            if (!success) {
                continue;
            }

            await deleteTaskFromFirebase(task.id);
        }

        // Then fix indexes if necessary
        if (needsIndexSync || expiredTasks.length > 0) {

            await syncTaskOrderFirebase(tasks);
        }

        setPendingMaintenance(null);


    }

    async function archiveTaskToFirebase(task) {
        console.log(">>> ARCHIVE START", task);


        try {

            const tasksRef = collection(
                db,
                "users",
                user.uid,
                "archives"
            );

            const snapshot = await getCountFromServer(tasksRef);

            const archiveCount = snapshot.data().count;




            // adding the task to the archives
            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid,
                    "archives",
                    task.id
                ),
                { ...task, index: archiveCount }
            );

            return true;

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    // syncs task order indexes whenever we rearrange tasks with drag and drop or delete 
    async function syncTaskOrderFirebase(updatedTasks) {

        console.log(">>> SYNC START", updatedTasks);



        for (const task of updatedTasks) {
            // updating each doc's/task's index one by one


            try {
                const ref = doc(
                    db,
                    "users",
                    user.uid,
                    list,
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


    function handleDragEnd(event) {

        // LOCAL UI UPDATE
        const reordered = arrayMove(tasks, tasks.findIndex(t => t.id === event.active.id), tasks.findIndex(t => t.id === event.over.id));

        const updatedReorder = reordered.map((task, index) => ({
            ...task,
            index
        }))
        setTasks(updatedReorder);

        // DB SYNC
        syncTaskOrderFirebase(updatedReorder);

        // reordering the array according to the drag and drop positions
        setDropped(true);
    }
    function handleDragStart() {
        setDropped(false);
    }

    return { tasks, dropped, syncing, addTask, deleteTask, toggleTask, handleDragEnd, handleDragStart }
}

export default useTasks;