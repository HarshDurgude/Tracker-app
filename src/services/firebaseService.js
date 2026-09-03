import { db } from "./firebase";
import { LexoRank } from "lexorank";
import {
    collection,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    writeBatch,
    limit
} from "firebase/firestore";

export async function fetchUserCollection(uid, collectionName, sortOrder = "asc") {

    const q = query(// using query and orderby func to get things in order by index 
        // beacuse firestore doesnt store elements in order
        collection(db, "users", uid, collectionName),
        orderBy("index", sortOrder),

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


export async function deleteTaskDoc(uid, collectionName, taskId) {
    const ref = doc(db, "users", uid, collectionName, taskId);
    await deleteDoc(ref);
}


export async function archiveExpiredTasksBatch(uid, expiredTasks, nextIndex) {
    if (expiredTasks.length === 0) return;

    const batch = writeBatch(db);

    let rank = LexoRank.parse(nextIndex);


    expiredTasks.forEach((task) => {

        const archiveRef = doc(db, "users", uid, "archives", task.id);
        const deleteRef = doc(db, "users", uid, "tasks", task.id);

        batch.set(archiveRef, {
            ...task, index: rank.toString()
        });

        batch.delete(deleteRef);

        rank = rank.genNext();
    });

    await batch.commit();

}

export async function getNextIndex(uid, collectionName) {
    const q = query(
        collection(db, "users", uid, collectionName),
        orderBy("index", "desc"),
        limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return LexoRank.middle().toString();
    }

    const lastTask = snapshot.docs[0].data();

    return LexoRank.parse(lastTask.index)
        .genNext()
        .toString();
}