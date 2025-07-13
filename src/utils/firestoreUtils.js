import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export async function deleteAllResults() {
  const snapshot = await getDocs(collection(db, "results"));
  const promises = snapshot.docs.map(d => deleteDoc(doc(db, "results", d.id)));
  await Promise.all(promises);
}