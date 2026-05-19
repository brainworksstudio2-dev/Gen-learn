import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/auth';
import { RoadmapItem, Assignment, Material, Submission, User, Attendance } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

import { OFFICIAL_CURRICULUM } from '../constants';

// --- Curriculum (Roadmap) ---
export const getCohortProgress = async (gen: string): Promise<number> => {
  if (!gen || gen === 'all') return 1;
  try {
    const docRef = doc(db, 'cohortProgress', gen);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().currentWeek || 1;
    }
    return 1;
  } catch (error) {
    console.error("Failed to get cohort progress:", error);
    return 1;
  }
};

export const updateCohortProgress = async (gen: string, week: number) => {
  const path = `cohortProgress/${gen}`;
  try {
    const docRef = doc(db, 'cohortProgress', gen);
    await setDoc(docRef, { currentWeek: week, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getRoadmap = async (gen?: string): Promise<RoadmapItem[]> => {
  let currentWeek = 1; // Default
  if (gen && gen !== 'all') {
    currentWeek = await getCohortProgress(gen);
  }

  // Return hardcoded curriculum mapped with dynamic status based on currentWeek
  return OFFICIAL_CURRICULUM.map((item, index) => ({
    ...item,
    id: `static-${index}`,
    status: item.week < currentWeek ? 'completed' : (item.week === currentWeek ? 'current' : 'upcoming')
  })) as RoadmapItem[];
};

// --- Assignments ---
export const getAssignments = async (gen?: string): Promise<Assignment[]> => {
  const path = 'assignments';
  try {
    const assignmentsRef = collection(db, path);
    let q;
    
    if (gen && gen !== 'all') {
      // Fetch both specific gen and 'all'
      // Note: This requires an 'in' query or two separate calls. 
      // Firestore 'in' has limits but for 2 values it's fine.
      q = query(assignmentsRef, where('gen', 'in', [gen, 'all']), orderBy('deadline', 'asc'));
    } else {
      q = query(assignmentsRef, orderBy('deadline', 'asc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Assignment));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const addAssignment = async (data: any) => {
  const path = 'assignments';
  try {
    return await addDoc(collection(db, path), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateAssignment = async (id: string, data: Partial<Assignment>) => {
  const path = `assignments/${id}`;
  try {
    const docRef = doc(db, 'assignments', id);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// --- Materials ---
export const getMaterials = async (gen?: string): Promise<Material[]> => {
  const path = 'materials';
  try {
    const materialsRef = collection(db, path);
    let q;
    
    if (gen && gen !== 'all') {
      q = query(materialsRef, where('gen', 'in', [gen, 'all']), orderBy('week', 'asc'));
    } else {
      q = query(materialsRef, orderBy('week', 'asc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Material));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const addMaterial = async (data: any) => {
  const path = 'materials';
  try {
    return await addDoc(collection(db, path), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateMaterial = async (id: string, data: Partial<Material>) => {
  const path = `materials/${id}`;
  try {
    const docRef = doc(db, 'materials', id);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// --- Submissions ---
export const submitAssignment = async (assignmentId: string, link: string) => {
  if (!auth.currentUser) throw new Error('Must be signed in to submit');
  const path = 'submissions';
  try {
    const submission = {
      assignment_id: assignmentId,
      student_id: auth.currentUser.uid,
      link,
      submitted_at: new Date().toISOString(),
      status: 'pending'
    };
    return await addDoc(collection(db, path), submission);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getSubmissionsForUser = async (userId: string) => {
  const path = 'submissions';
  try {
    const q = query(collection(db, path), where('student_id', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Submission));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getAllSubmissions = async (): Promise<Submission[]> => {
  const path = 'submissions';
  try {
    const q = query(collection(db, path), orderBy('submitted_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Submission));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

// --- Attendance ---
export const getAttendance = async (gen?: string): Promise<Attendance[]> => {
  const path = 'attendance';
  try {
    let q = query(collection(db, path), orderBy('date', 'desc'));
    if (gen) {
      q = query(q, where('gen', '==', gen));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Attendance));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getExpectedAttendanceDates = async (gen: string): Promise<number> => {
  const path = 'attendance';
  try {
    const q = query(collection(db, path), where('gen', '==', gen));
    const snapshot = await getDocs(q);
    const uniqueDates = new Set<string>();
    snapshot.docs.forEach(doc => {
      const data = doc.data() as Attendance;
      uniqueDates.add(data.date);
    });
    return uniqueDates.size;
  } catch (error) {
    console.error("Failed to get expected attendance dates:", error);
    return 0;
  }
};

export const getStudentAttendance = async (studentId: string): Promise<Attendance[]> => {
  const path = 'attendance';
  try {
    const q = query(collection(db, path), where('student_id', '==', studentId));
    const snapshot = await getDocs(q);
    // Sort client-side to avoid needing a composite index for student_id + date
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Attendance))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const markStudentAttendance = async (gen: string) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  const path = 'attendance';
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Check if already marked today
    const q = query(
      collection(db, path), 
      where('student_id', '==', auth.currentUser.uid),
      where('date', '==', today)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      throw new Error("Attendance already marked for today");
    }

    const newRecord = {
      student_id: auth.currentUser.uid,
      date: today,
      gen: gen,
      status: 100,
      score: 100,
      timestamp: new Date().toISOString()
    };
    
    return await addDoc(collection(db, path), newRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

// --- Users ---
export const getAllProfiles = async (gen?: string): Promise<User[]> => {
  const path = 'users';
  try {
    let q = query(collection(db, 'users'), where('role', '==', 'student'));
    if (gen) {
      q = query(q, where('gen', '==', gen));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as User));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const updateProfile = async (userId: string, data: Partial<User>) => {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};
