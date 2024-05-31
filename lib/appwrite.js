// import { Account,Client,ID,Avatars,Databases,Query, Storage, } from "react-native-appwrite"
import { ID,Account,Client,Avatars,Databases,Query,Storage } from "appwrite";
import values from "./config";

export const appwriteConfig ={
    endpoint:values.endpoint,
    platform: values.platform,
    projectId:values.projectId,
    databaseId: values.databaseId,
    userCollectionId: values.userCollectionId,
    videoCollectionId: values.videoCollectionId,
    savedCollectionId:values.savedCollectionId,
    storageId: values.storageId,
}

// export const appwriteConfig ={
//     endpoint:process.env.ENDPOINT,
//     platform: process.env.PLATFORM,
//     projectId:process.env.PROJECT_ID,
//     databaseId: process.env.DATABASE_ID,
//     userCollectionId: process.env.USER_COLLECTION_ID,
//     videoCollectionId: process.env.VIDEO_COLLECTION_ID,
//     savedCollectionId:process.env.SAVED_COLLECTION_ID,
//     storageId: process.env.STORAGE_ID,
// }

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)

//  .setPlatform(appwriteConfig.platform);
const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

  // Register User
  export async function createUser (email,password,username){
    try{
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )
        if (!newAccount) throw Error;
        const avatarUrl = avatars.getInitials(username);
        // await signIn(email,password)

        const newUser = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          ID.unique(),
          {
            accountId: newAccount.$id,
            email: email,
            username: username,
            avatar: avatarUrl,
          }
        );
        return newUser

    }catch(error){
        console.log(error);
        throw new Error(error);
    }
  }

  export async function signIn(email,password){
    try{
      // await account.deleteSession("current");
      const session = await account.createEmailPasswordSession(email,password)
      // await account.getSession("current")
      return session;
    }catch(error){
        console.log(error);
        throw new Error(error); 
    }
  }
  
  export async function getCurrentUser(){
    try{
      const currentAccount=await account.get();
      if (!currentAccount) throw Error
      const currentUser = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", currentAccount.$id)]
      );
      if (!currentUser) throw Error;
      return currentUser.documents[0];

    }catch(error){
      console.log(error)
      return null;
    }
  }

  export const getAllPosts =async()=>{
    try{
      console.log(process.env.ENDPOINT)
      const posts=await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.videoCollectionId
      )
      return posts.documents;
    }catch(error){
      throw new Error(error)
    }
  }

  export async function getLatestPosts() {
    try {
      const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.videoCollectionId,
        [Query.orderDesc("$createdAt"), Query.limit(7)]
      );
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
  }

  export const searchPosts =async(query)=>{
    try {
      const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.videoCollectionId,
        [Query.search("title", query)]
      );
  
      if (!posts) throw new Error("Something went wrong");
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
  }

  export const getUserPosts =async(userId)=>{
    try {
      const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.videoCollectionId,
        [Query.equal("creator", userId)]
      );
  
      if (!posts) throw new Error("Something went wrong");
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
  }
 
  export const signOut =async()=>{
    try{
      const session= await account.deleteSession('current')
      return session
    }catch(error){
      throw new Error(error)
    }
  }

export const getFilePreview=async(fileId,type)=>{
  let fileUrl;
  try{
    if(type==='video'){
      fileUrl=storage.getFileView(appwriteConfig.storageId,fileId)
    }else if(type==='image'){
      fileUrl=storage.getFilePreview(appwriteConfig.storageId,fileId,2000,2000,'top',100)
    }else{
      throw new Error('Invalid file type')
    }
    if(!fileUrl) throw Error;
    return fileUrl

  }catch(error){
    throw new Error(error)
  }
}

export const uploadFile=async(file,type)=>{
  if(!file) return;
  const {mimeType,...rest}=file
  const asset={type:mimeType,...rest}
  try{
    const uploadedFile =await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    )
    const fileUrl=await getFilePreview(uploadedFile.$id,type);
    return fileUrl
  }catch(error){
    throw new Error(error)
  }
}
  
export const createVideo =async(form)=>{
  try{
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        prompt: form.prompt,
        video: videoUrl,
        creator: form.userId,
      }
    );

    return newPost;
  }catch(error){
    throw new Error(error)
  }
}

export const updateVideo =async(docId,title,thumbnail,prompt,video,userId)=>{
  try{
    const doc=await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      docId
    )
    let docS=doc.saved
    if (docS.indexOf(userId) > -1){
      throw new Error("Already Saved!");
    }
    const updatePost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      docId,
      {
        saved:[...doc.saved,userId]
      }
    );
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savedCollectionId,
      ID.unique(),
      {
        title: title,
        thumbnail: thumbnail,
        prompt: prompt,
        video: video,
        creator: userId,
      }
    );
    return newPost;
  }catch(error){
    throw new Error(error)
  }
}

export const bookmarkPosts =async(userId)=>{
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savedCollectionId,
      [Query.equal("creator", userId)]
    );

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export const bookSearchPosts =async(query)=>{
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savedCollectionId,
      [Query.search("title", query)]
    );

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}