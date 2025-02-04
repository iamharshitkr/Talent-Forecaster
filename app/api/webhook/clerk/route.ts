// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/firebase/firestore'; 
// import { doc, setDoc, deleteDoc } from "firebase/firestore";

// export async function POST(req: NextRequest) {
//   try {
//     const payload = await req.json();

//     switch (payload.type) {
//       case 'user.created':
//         await setDoc(doc(db, "users", payload.data.id), {
//           email: payload.data.email,
//           createdAt: new Date().toISOString(),
//         });
//         console.log('✅ User created');
//         break;

//       case 'user.deleted':
//         await deleteDoc(doc(db, "users", payload.data.id));
//         console.log('✅ User deleted');
//         break;

//       default:
//         console.warn('Unhandled event type:', payload.type);
//     }

//     return NextResponse.json({ message: 'Success' }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }
