import {
  collection,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Customer, OrderItem, UserProfile, WorkOrder, OrderPhoto, CatalogItem } from '../types';
import { Platform } from 'react-native';

// Nome das coleções no Firestore
const CUSTOMERS_COLLECTION = 'customers';
const ORDERS_COLLECTION = 'work_orders';
const PROFILES_COLLECTION = 'profiles';
const CATALOG_COLLECTION = 'catalog';

// --- CATÁLOGO DE SERVIÇOS ---

// Criar Item no Catálogo
export const addCatalogItem = async (userId: string, item: Omit<CatalogItem, 'id' | 'userId'>) => {
  try {
    const docRef = await addDoc(collection(db, CATALOG_COLLECTION), {
      ...item,
      userId,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...item };
  } catch (error) {
    console.error('Erro ao criar item no catálogo:', error);
    throw error;
  }
};

// Listar Itens do Catálogo
export const getCatalogItems = async (userId: string): Promise<CatalogItem[]> => {
  try {
    const q = query(
      collection(db, CATALOG_COLLECTION),
      where('userId', '==', userId),
      orderBy('title', 'asc'), // Ordenado por nome (alfabético)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          userId,
          ...doc.data(),
        }) as CatalogItem,
    );
  } catch (error) {
    // Se der erro de índice, o console avisa, mas geralmente order by title é seguro
    console.error('Erro ao buscar catálogo:', error);
    throw error;
  }
};

// Deletar Item do Catálogo
export const deleteCatalogItem = async (itemId: string) => {
  try {
    await deleteDoc(doc(db, CATALOG_COLLECTION, itemId));
  } catch (error) {
    throw error;
  }
};

export const uploadImageToCloudinary = async (
  imageUri: string,
  folder: string = 'servus_photos',
): Promise<string> => {
  try {
    const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const data = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      data.append('file', blob);
    } else {
      data.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      } as any);
    }

    data.append('upload_preset', UPLOAD_PRESET);
    data.append('folder', folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
    });

    const result = await response.json();
    if (result.secure_url) return result.secure_url;
    throw new Error('Falha upload imagem');
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// ADICIONADO: Adicionar foto à O.S.
export const addPhotoToOrder = async (orderId: string, photo: OrderPhoto) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    // arrayUnion adiciona ao array sem apagar o que já tem
    await updateDoc(orderRef, {
      photos: arrayUnion(photo),
    });
  } catch (error) {
    throw error;
  }
};

// ADICIONADO: Remover foto da O.S.
export const removePhotoFromOrder = async (orderId: string, photoToDelete: OrderPhoto) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const snapshot = await getDoc(orderRef);

    const data = snapshot.data();
    const currentPhotos: OrderPhoto[] = data?.photos || [];

    const updatedPhotos = currentPhotos.filter((p) => p.id !== photoToDelete.id);

    await updateDoc(orderRef, {
      photos: updatedPhotos,
    });
  } catch (error) {
    console.error('Erro ao remover foto:', error);
    throw error;
  }
};

// Função para upload de Base64 (Assinatura)
export const uploadSignature = async (base64Img: string): Promise<string> => {
  try {
    const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    let cleanBase64 = base64Img;
    if (!cleanBase64.startsWith('data:image')) {
      cleanBase64 = `data:image/png;base64,${base64Img}`;
    }

    const data = new FormData();
    data.append('file', cleanBase64); // Cloudinary aceita Base64 direto!
    data.append('upload_preset', UPLOAD_PRESET);
    data.append('folder', 'servus_signatures');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
    });

    const result = await response.json();
    if (result.secure_url) return result.secure_url;
    console.error('Erro Cloudinary:', result);
    throw new Error('Erro upload assinatura');
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Função para atualizar a O.S. com a assinatura
export const addSignatureToOrder = async (orderId: string, signatureUrl: string) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      signatureUrl: signatureUrl,
      status: 'completed',
    });
  } catch (error) {
    throw error;
  }
};

// Salvar/Atualizar Perfil
export const saveUserProfile = async (userId: string, data: UserProfile) => {
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, userId), data, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    throw error;
  }
};

// Buscar Perfil
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = await getDoc(doc(db, PROFILES_COLLECTION, userId));
    if (docRef.exists()) {
      return docRef.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
};

// Função de Upload para o Cloudinary
export const uploadLogo = async (userId: string, imageUri: string): Promise<string> => {
  try {
    const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const data = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      data.append('file', blob);
    } else {
      data.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `logo_${userId}.jpg`,
      } as any);
    }

    data.append('upload_preset', UPLOAD_PRESET);
    data.append('folder', 'servus_logos');

    // 3. Enviar para a API do Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
    });

    const result = await response.json();

    if (result.secure_url) {
      return result.secure_url; // Retorna o link da imagem na internet
    } else {
      console.error('Erro Cloudinary:', result);
      throw new Error('Falha ao obter URL da imagem');
    }
  } catch (error) {
    console.error('Erro no upload Cloudinary:', error);
    throw error;
  }
};

// --- CLIENTES ---

// Criar novo cliente
export const createCustomer = async (userId: string, customerData: Omit<Customer, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
      ...customerData,
      userId, // VITAL: Amarra o dado ao usuário logado
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...customerData };
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
};

// Buscar clientes apenas do usuário logado
export const getMyCustomers = async (userId: string): Promise<Customer[]> => {
  try {
    const q = query(
      collection(db, CUSTOMERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Customer,
    );
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
};

// Atualizar Cliente
export const updateCustomer = async (customerId: string, data: Partial<Customer>) => {
  try {
    const ref = doc(db, CUSTOMERS_COLLECTION, customerId);
    await updateDoc(ref, data);
  } catch (error) {
    throw error;
  }
};

// Deletar Cliente
export const deleteCustomer = async (customerId: string) => {
  try {
    await deleteDoc(doc(db, CUSTOMERS_COLLECTION, customerId));
  } catch (error) {
    throw error;
  }
};

// --- ORDENS DE SERVIÇO ---

interface CreateOrderParams {
  userId: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
}

export const createWorkOrder = async ({ userId, customer, items, total }: CreateOrderParams) => {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      userId,
      customerId: customer.id,
      customer_name: customer.name, // Salva o nome para facilitar listagem
      items,
      total,
      status: 'open', // Status padrão
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar O.S.:', error);
    throw error;
  }
};

// Buscar Ordens do usuário
export const getMyOrders = async (userId: string): Promise<WorkOrder[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkOrder[];
  } catch (error) {
    console.error('Erro ao buscar ordens:', error);
    throw error;
  }
};

// Atualizar Status da O.S.
export const updateOrderStatus = async (
  orderId: string,
  newStatus: 'open' | 'completed' | 'paid' | 'draft',
) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status: newStatus,
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
};

// Deletar O.S.
export const deleteOrder = async (orderId: string) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error('Erro ao deletar ordem:', error);
    throw error;
  }
};

export const getOrdersByMonth = async (userId: string, month: number, year: number) => {
  try {
    const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endStr = `${year}-${String(month + 1).padStart(2, '0')}-31`;

    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      where('date', '>=', startStr),
      where('date', '<=', endStr),
      orderBy('date', 'desc'),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as WorkOrder,
    );
  } catch (error) {
    console.error('Erro financeiro:', error);
    throw error;
  }
};

// Função de Verificação de Limite (Regra de Negócio)
export const checkMonthlyLimit = async (userId: string): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId);
    const isPro = profile?.plan === 'pro';

    if (isPro) return true;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      where('date', '>=', startOfMonth),
      where('date', '<=', endOfMonth),
    );

    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;

    const LIMIT = 5;

    if (count >= LIMIT) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao verificar limite:', error);
    return true;
  }
};
