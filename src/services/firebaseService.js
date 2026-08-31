import { db } from "./firebase";
import {
    collection,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    getCountFromServer,
} from "firebase/firestore";

export async function fetchUserCollection(uid, collectionName, sortOrder = "asc") {

    const q = query(// using query and orderby func to get things in order by index 
        // beacuse firestore doesnt store elements in order
        collection(db, "users", uid, collectionName),
        orderBy("index", sortOrder)
    );
    return await getDocs(q); // this returns a querySnapshot
}

export async function addTaskDoc(uid, collectionName, task) {
    const ref = doc(db, "users", uid, collectionName, task.id);
    // before we used addDoc but it didnt allow giving our own firebaseId so we
    // are using setDoc() so we can give our id so same copy stays on local & cloud
    await setDoc(ref, task);
}

export async function updateTaskFieldsDoc(uid, collectionName, taskId, fields) {
    const ref = doc(db, "users", uid, collectionName, taskId);
    await updateDoc(ref, fields);
}

export async function getCollectionCount(uid, collectionName) {
    const ref = collection(db, "users", uid, collectionName);
    const snapshot = await getCountFromServer(ref);
    return snapshot.data().count;
}

export async function deleteTaskDoc(uid, collectionName, taskId) {
    const ref = doc(db, "users", uid, collectionName, taskId);
    await deleteDoc(ref);
}

export async function batchSyncIndexes(uid, collectionName, tasks) {
    for (const task of tasks) {
        try {
            await updateTaskFieldsDoc(uid, collectionName, task.id, { index: task.index });
        } catch (err) {
            console.error("Index sync error for task:", task.id, err);
        }
    }
}
