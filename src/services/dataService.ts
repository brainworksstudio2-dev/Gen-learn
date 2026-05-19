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
  getDoc
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
export const getRoadmap = async (): Promise<RoadmapItem[]> => {
  // Return hardcoded curriculum instead of fetching from Firestore
  return OFFICIAL_CURRICULUM.map((item, index) => ({
    ...item,
    id: `static-${index}`,
    status: item.week <= 3 ? 'completed' : (item.week <= 12 ? 'current' : 'upcoming')
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
